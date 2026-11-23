import * as THREE from "three";

export interface DogRig {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  earL: THREE.Group;
  earR: THREE.Group;
  browL: THREE.Group;
  browR: THREE.Group;
  lidL: THREE.Mesh;
  lidR: THREE.Mesh;
  jaw: THREE.Group;
  tail: THREE.Group;
  tailSeg1: THREE.Mesh;
  tailSeg2: THREE.Mesh;
  pawFL: THREE.Group;
  pawFR: THREE.Group;
  legFL: THREE.Group;
  legFR: THREE.Group;
  tag: THREE.Mesh;
  mats: Record<
    "fur" | "furDark" | "cream" | "nose" | "eye" | "collar" | "tag",
    THREE.MeshStandardMaterial
  >;
  disposeTextures: () => void;
}

const FUR_BASE = "#e3a664";
const FUR_DARK_BASE = "#cf8b4a";
const CREAM_BASE = "#f7e7d0";
const JAW_TINT = "#e8c396";
const NOSE_HEX = 0x1d130e;
const EYE_IRIS_HEX = 0x5c3014;
const PUPIL_HEX = 0x0b0807;
const COLLAR_HEX = 0x4da8da;
const TAG_HEX = 0xe8c15a;
const TONGUE_HEX = 0xe88b94;

function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  return [canvas, ctx];
}

function createFurTextures(
  baseHex: string,
  highlightHex: string,
  shadowHex: string,
  seed: number,
  repeatX = 2,
  repeatY = 2,
): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 256;
  const rand = seededRandom(seed);

  const [colorCanvas, cCtx] = makeCanvas(size);
  const [bumpCanvas, bCtx] = makeCanvas(size);
  const [roughCanvas, rCtx] = makeCanvas(size);

  cCtx.fillStyle = baseHex;
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = "#808080";
  bCtx.fillRect(0, 0, size, size);

  rCtx.fillStyle = "#d2d2d2";
  rCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 180; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 18 + rand() * 42;
    const grad = cCtx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, rand() > 0.45 ? highlightHex : shadowHex);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    cCtx.globalAlpha = 0.08 + rand() * 0.08;
    cCtx.fillStyle = grad;
    cCtx.beginPath();
    cCtx.arc(x, y, r, 0, Math.PI * 2);
    cCtx.fill();
  }
  cCtx.globalAlpha = 1;

  const strandCount = 2400;
  for (let i = 0; i < strandCount; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const len = 6 + rand() * 10;
    const drift = (rand() - 0.5) * 2.8;
    const width = 0.6 + rand() * 1.0;
    const bright = rand() > 0.42;

    cCtx.strokeStyle = bright ? highlightHex : shadowHex;
    cCtx.globalAlpha = 0.08 + rand() * 0.12;
    cCtx.lineWidth = width;
    cCtx.lineCap = "round";
    cCtx.beginPath();
    cCtx.moveTo(x, y);
    cCtx.quadraticCurveTo(x + drift * 0.5, y + len * 0.5, x + drift, y + len);
    cCtx.stroke();

    const bVal = bright ? Math.floor(144 + rand() * 55) : Math.floor(82 + rand() * 40);
    bCtx.strokeStyle = `rgb(${bVal},${bVal},${bVal})`;
    bCtx.globalAlpha = 0.16 + rand() * 0.18;
    bCtx.lineWidth = width * 0.9;
    bCtx.lineCap = "round";
    bCtx.beginPath();
    bCtx.moveTo(x, y);
    bCtx.quadraticCurveTo(x + drift * 0.5, y + len * 0.5, x + drift, y + len);
    bCtx.stroke();

    const rVal = bright ? Math.floor(186 + rand() * 24) : Math.floor(212 + rand() * 28);
    rCtx.strokeStyle = `rgb(${rVal},${rVal},${rVal})`;
    rCtx.globalAlpha = 0.2;
    rCtx.lineWidth = width;
    rCtx.lineCap = "round";
    rCtx.beginPath();
    rCtx.moveTo(x, y);
    rCtx.quadraticCurveTo(x + drift * 0.5, y + len * 0.5, x + drift, y + len);
    rCtx.stroke();
  }

  cCtx.globalAlpha = 1;
  bCtx.globalAlpha = 1;
  rCtx.globalAlpha = 1;

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeatX, repeatY);
  map.needsUpdate = true;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(repeatX, repeatY);
  bumpMap.needsUpdate = true;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(repeatX, repeatY);
  roughnessMap.needsUpdate = true;

  return { map, bumpMap, roughnessMap };
}

function createHeadFurMap(seed: number): THREE.CanvasTexture {
  const size = 256;
  const rand = seededRandom(seed);
  const [canvas, ctx] = makeCanvas(size);

  ctx.fillStyle = FUR_BASE;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 140; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 20 + rand() * 45;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, rand() > 0.45 ? "#f2c48a" : "#c98344");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Soft warm golden-cream muzzle & chin blend centered at u=0.5 (x=256), v~0.36 (y~328)
  const muzzleGrad = ctx.createRadialGradient(256, 328, 14, 256, 328, 92);
  muzzleGrad.addColorStop(0, "#f6e2c6");
  muzzleGrad.addColorStop(0.48, "#efd2aa");
  muzzleGrad.addColorStop(0.8, "rgba(235, 194, 142, 0.48)");
  muzzleGrad.addColorStop(1, "rgba(227, 166, 100, 0)");
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = muzzleGrad;
  ctx.beginPath();
  ctx.ellipse(256, 328, 84, 88, 0, 0, Math.PI * 2);
  ctx.fill();

  // Subtle warm golden-cream brow glow integrated smoothly into forehead fur
  for (const cx of [224, 288]) {
    const browGrad = ctx.createRadialGradient(cx, 208, 3, cx, 208, 26);
    browGrad.addColorStop(0, "rgba(246, 218, 178, 0.45)");
    browGrad.addColorStop(1, "rgba(227, 166, 100, 0)");
    ctx.fillStyle = browGrad;
    ctx.beginPath();
    ctx.arc(cx, 208, 26, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 7200; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const dx = x - 256;
    const dy = y - 328;
    const distMuzzle = Math.sqrt((dx / 80) ** 2 + (dy / 84) ** 2);
    const inMuzzle = distMuzzle < 1.0;

    const angle = Math.atan2(y - 240, x - 256);
    const len = 5 + rand() * 8;
    const dirX = Math.cos(angle) * len * 0.35 + (rand() - 0.5) * 2;
    const dirY = Math.sin(angle) * len * 0.35 + len * 0.65;

    if (inMuzzle) {
      ctx.strokeStyle = rand() > 0.35 ? "#faebd4" : "#e6c294";
      ctx.globalAlpha = 0.1 + rand() * 0.1;
    } else {
      ctx.strokeStyle = rand() > 0.45 ? "#f3c68d" : "#c67f40";
      ctx.globalAlpha = 0.08 + rand() * 0.11;
    }
    ctx.lineWidth = 0.6 + rand() * 0.9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dirX, y + dirY);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

function createBodyFurMap(seed: number): THREE.CanvasTexture {
  const size = 256;
  const rand = seededRandom(seed);
  const [canvas, ctx] = makeCanvas(size);

  ctx.fillStyle = FUR_BASE;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 160; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 22 + rand() * 48;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, rand() > 0.45 ? "#f1c287" : "#c88243");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const chestGrad = ctx.createRadialGradient(256, 215, 18, 256, 215, 145);
  chestGrad.addColorStop(0, "#faeedc");
  chestGrad.addColorStop(0.48, "#f4dfc2");
  chestGrad.addColorStop(0.8, "rgba(240, 208, 166, 0.45)");
  chestGrad.addColorStop(1, "rgba(227, 166, 100, 0)");
  ctx.globalAlpha = 0.94;
  ctx.fillStyle = chestGrad;
  ctx.beginPath();
  ctx.ellipse(256, 215, 84, 152, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 7600; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const distChest = Math.sqrt(((x - 256) / 80) ** 2 + ((y - 215) / 145) ** 2);
    const inChest = distChest < 1.0;
    const len = 5 + rand() * 9;
    const drift = (rand() - 0.5) * 2.2;

    ctx.strokeStyle = inChest
      ? rand() > 0.35
        ? "#fff6e8"
        : "#ebd0ab"
      : rand() > 0.45
        ? "#f2c48a"
        : "#c67f40";
    ctx.globalAlpha = 0.08 + rand() * 0.11;
    ctx.lineWidth = 0.6 + rand() * 0.9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + drift, y + len);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

function createNoseBumpTexture(): THREE.CanvasTexture {
  const size = 128;
  const rand = seededRandom(901);
  const [canvas, ctx] = makeCanvas(size);
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 1400; i += 1) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 0.8 + rand() * 1.6;
    const v = rand() > 0.5 ? 175 : 85;
    ctx.fillStyle = `rgba(${v},${v},${v},0.35)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.needsUpdate = true;
  return tex;
}

function createBrushedMetalTexture(): THREE.CanvasTexture {
  const size = 128;
  const rand = seededRandom(777);
  const [canvas, ctx] = makeCanvas(size);
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += 1) {
    const v = Math.floor(105 + rand() * 50);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(0, y, size, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Builds a continuous, twist-free lofted spine mesh for the seated torso, chest, and plush neck
 * that flares gently into the skull base to eliminate any bobblehead seam.
 */
function buildLoftedTorsoGeometry(): THREE.BufferGeometry {
  const spineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.14, -0.14), // seated rump base
    new THREE.Vector3(0, 0.02, -0.04),  // lower pelvis
    new THREE.Vector3(0, 0.24, 0.12),   // mid ribcage
    new THREE.Vector3(0, 0.48, 0.28),   // proud chest / shoulders
    new THREE.Vector3(0, 0.64, 0.335),  // collar base
    new THREE.Vector3(0, 0.74, 0.345),  // tucked cleanly inside collar & head neck-skirt
  ]);

  const rings = 44;
  const segs = 40;
  const positions: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  const profileAt = (t: number) => {
    const bottomCap = smoothstep(0.0, 0.12, t) * 0.82 + 0.18;
    const topTuck = 1 - smoothstep(0.88, 1.0, t) * 0.22;
    const rumpSwell = Math.exp(-((t - 0.18) ** 2) / 0.035) * 0.11;
    const ribSwell = Math.exp(-((t - 0.46) ** 2) / 0.055) * 0.135;
    const chestSwell = Math.exp(-((t - 0.66) ** 2) / 0.035) * 0.135;
    const neckTaper = smoothstep(0.68, 0.9, t);

    const rx =
      THREE.MathUtils.lerp(0.165 + rumpSwell + ribSwell * 0.85, 0.176, neckTaper) *
      bottomCap *
      topTuck;
    const rFront =
      THREE.MathUtils.lerp(0.175 + rumpSwell * 0.7 + ribSwell + chestSwell, 0.18, neckTaper) *
      bottomCap *
      topTuck;
    const rBack =
      THREE.MathUtils.lerp(0.165 + rumpSwell * 0.9 + ribSwell * 0.75, 0.178, neckTaper) *
      bottomCap *
      topTuck;
    return { rx, rFront, rBack };
  };

  const right = new THREE.Vector3(1, 0, 0);
  const normal = new THREE.Vector3();

  for (let r = 0; r <= rings; r += 1) {
    const t = r / rings;
    const center = spineCurve.getPoint(t);
    const tangent = spineCurve.getTangent(t).normalize();
    normal.crossVectors(right, tangent).normalize();

    const { rx, rFront, rBack } = profileAt(t);

    for (let s = 0; s <= segs; s += 1) {
      const u = s / segs;
      const theta = u * Math.PI * 2;
      const sinT = Math.sin(theta);
      const cosT = -Math.cos(theta);

      const rN = cosT >= 0 ? rFront : rBack;
      const bottomFlatten = t < 0.22 && cosT < 0 ? 0.88 : 1.0;

      const px = center.x + right.x * (sinT * rx) + normal.x * (cosT * rN * bottomFlatten);
      const py = center.y + right.y * (sinT * rx) + normal.y * (cosT * rN * bottomFlatten);
      const pz = center.z + right.z * (sinT * rx) + normal.z * (cosT * rN * bottomFlatten);

      positions.push(px, py, pz);
      uvs.push(u, t);

      const ao = 0.94 + 0.06 * smoothstep(0.05, 0.35, t);
      colors.push(ao, ao * 0.99, ao * 0.98);
    }
  }

  const stride = segs + 1;
  for (let r = 0; r < rings; r += 1) {
    for (let s = 0; s < segs; s += 1) {
      const a = r * stride + s;
      const b = a + stride;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const bottomCenter = positions.length / 3;
  const p0 = spineCurve.getPoint(0);
  positions.push(p0.x, p0.y, p0.z);
  uvs.push(0.5, 0);
  colors.push(0.9, 0.88, 0.86);

  const topCenter = positions.length / 3;
  const p1 = spineCurve.getPoint(1);
  positions.push(p1.x, p1.y, p1.z);
  uvs.push(0.5, 1);
  colors.push(0.94, 0.92, 0.9);

  const topStart = rings * stride;
  for (let s = 0; s < segs; s += 1) {
    indices.push(bottomCenter, s, s + 1);
    indices.push(topCenter, topStart + s + 1, topStart + s);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Evaluates the exact sculpted puppy head surface point for a unit sphere direction (nx, ny, nz).
 * Smoothly blends the lower skull base downward into the neck to avoid any bobblehead crease.
 */
function evalHeadPoint(nx: number, ny: number, nz: number): {
  x: number;
  y: number;
  z: number;
  socket: number;
} {
  let x = nx * 0.255;
  let y = ny * 0.245 + 0.2;
  let z = nz * 0.245 + 0.01;

  // Soft rounded puppy cheeks
  const cheekMask =
    smoothstep(-0.55, -0.05, ny) *
    (1 - smoothstep(0.05, 0.42, ny)) *
    smoothstep(0.32, 0.78, Math.abs(nx)) *
    smoothstep(-0.25, 0.45, nz);
  x += Math.sign(nx) * cheekMask * 0.034;
  z += cheekMask * 0.015;

  // Fuller puppy forehead & brow ridge above the eyes
  const browDome = smoothstep(0.06, 0.72, ny) * smoothstep(0.05, 0.88, nz);
  y += browDome * 0.026;
  z += browDome * 0.038;

  // Deeper eye socket hollows so glossy eyes sit naturally inside the face contour
  const eyeDistL = Math.hypot(nx + 0.42, ny - 0.11, nz - 0.86);
  const eyeDistR = Math.hypot(nx - 0.42, ny - 0.11, nz - 0.86);
  const socket =
    Math.exp(-(eyeDistL ** 2) / 0.048) + Math.exp(-(eyeDistR ** 2) / 0.048);
  z -= socket * 0.034;

  // Subtle nose bridge ridge between the eyes so far eye stays tucked in profile
  const bridge =
    Math.exp(-(nx ** 2) / 0.045) *
    smoothstep(-0.25, 0.25, ny) *
    smoothstep(0.6, 0.98, nz);
  z += bridge * 0.022;

  // Rounded, tapered puppy snout
  const muzzleMask =
    smoothstep(0.45, 0.94, nz) *
    smoothstep(-0.68, -0.24, ny) *
    (1 - smoothstep(-0.04, 0.24, ny));
  const snoutNarrow = 1 - muzzleMask * 0.44;
  x *= snoutNarrow;
  z += muzzleMask * 0.132;
  y -= muzzleMask * 0.01;

  // Soft plump whisker pads on left & right of upper snout
  const padL = Math.exp(-((nx + 0.18) ** 2 + (ny + 0.26) ** 2 + (nz - 0.92) ** 2) / 0.042);
  const padR = Math.exp(-((nx - 0.18) ** 2 + (ny + 0.26) ** 2 + (nz - 0.92) ** 2) / 0.042);
  const pads = padL + padR;
  z += pads * 0.015;
  y -= pads * 0.006;
  x += Math.sign(nx) * pads * 0.012;

  // Continuous chin-to-throat-to-neck sculpt extending cleanly down into the collar (zero seam!)
  const neckT = smoothstep(-0.12, -0.96, ny);
  if (neckT > 0) {
    const horizLen = Math.hypot(nx, nz) || 1e-5;
    const hx = nx / horizLen;
    const hz = nz / horizLen;
    const neckRx = 0.178;
    const neckRz = 0.182;
    const neckY = THREE.MathUtils.lerp(0.02, -0.155, neckT);
    const neckX = hx * neckRx;
    const neckZ = 0.005 + hz * neckRz;
    x = THREE.MathUtils.lerp(x, neckX, neckT);
    y = THREE.MathUtils.lerp(y, neckY, neckT);
    z = THREE.MathUtils.lerp(z, neckZ, neckT);
  }

  return { x, y, z, socket };
}

function buildSculptedHeadGeometry(): THREE.BufferGeometry {
  const latSegs = 48;
  const lonSegs = 54;
  const positions: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (let lat = 0; lat <= latSegs; lat += 1) {
    const v = lat / latSegs;
    const phi = v * Math.PI;
    const sinP = Math.sin(phi);
    const cosP = -Math.cos(phi);

    for (let lon = 0; lon <= lonSegs; lon += 1) {
      const u = lon / lonSegs;
      const theta = (u - 0.5) * Math.PI * 2;
      const nx = Math.sin(theta) * sinP;
      const ny = cosP;
      const nz = Math.cos(theta) * sinP;

      const { x, y, z, socket } = evalHeadPoint(nx, ny, nz);
      positions.push(x, y, z);
      uvs.push(u, v);

      const ao = 1 - socket * 0.05;
      colors.push(ao, ao * 0.99, ao * 0.98);
    }
  }

  const stride = lonSegs + 1;
  for (let lat = 0; lat < latSegs; lat += 1) {
    for (let lon = 0; lon < lonSegs; lon += 1) {
      const a = lat * stride + lon;
      const b = a + stride;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds a fuller, plush, rounded draped floppy ear framing the cheeks like a Golden Retriever pup.
 * side = -1 for left ear (-X), +1 for right ear (+X).
 */
function buildDrapedEarGeometry(side: number): THREE.BufferGeometry {
  const vSegs = 30;
  const uSegs = 24;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iv = 0; iv <= vSegs; iv += 1) {
    const v = iv / vSegs;
    const phi = v * Math.PI;
    const archOut = Math.sin(Math.min(1, v * 1.1) * Math.PI) * 0.055 + v * 0.048;
    const cx = side * (-0.035 + archOut);
    const cy = 0.015 - v * 0.31;
    const cz = Math.sin(v * Math.PI * 0.85) * 0.042;

    // Smooth closed spherical caps at both top root (v=0) and bottom lobe (v=1)
    const lobeProfile =
      Math.pow(Math.max(0, Math.sin(phi)), 0.62) *
      (0.78 + 0.38 * Math.sin(v * Math.PI * 0.75));
    const width = 0.125 * lobeProfile;
    const thick = 0.034 * Math.pow(Math.max(0, Math.sin(phi)), 0.55);

    for (let iu = 0; iu <= uSegs; iu += 1) {
      const u = iu / uSegs;
      const theta = u * Math.PI * 2;
      const localW = Math.cos(theta) * width;
      const rawT = Math.sin(theta);
      const localT = rawT >= 0 ? rawT * thick : rawT * thick * 0.55;

      const px = cx + side * localT;
      const py = cy;
      const pz = cz + localW;

      positions.push(px, py, pz);
      uvs.push(u, v);
    }
  }

  const stride = uSegs + 1;
  for (let iv = 0; iv < vSegs; iv += 1) {
    for (let iu = 0; iu < uSegs; iu += 1) {
      const a = iv * stride + iu;
      const b = a + stride;
      if (side > 0) {
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      } else {
        indices.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function buildSculptedNoseGeometry(): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(0.046, 28, 22);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const nx = x / 0.046;
    const ny = y / 0.046;
    const nz = z / 0.046;

    const widthScale = 1.2 - smoothstep(-0.1, -0.9, ny) * 0.38;
    x *= widthScale;
    y *= 0.82;
    z *= 0.88;

    if (nz > 0.2 && ny < 0.1) {
      const groove = Math.exp(-(nx ** 2) / 0.08) * smoothstep(0.1, -0.7, ny);
      z -= groove * 0.007;
    }

    if (nz > 0.25) {
      const nL = Math.exp(-((nx + 0.48) ** 2 + (ny + 0.18) ** 2) / 0.06);
      const nR = Math.exp(-((nx - 0.48) ** 2 + (ny + 0.18) ** 2) / 0.06);
      z -= (nL + nR) * 0.01;
    }

    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

function makeSculptedPaw(
  furMat: THREE.Material,
  creamMat: THREE.Material,
  scale = 1,
): THREE.Group {
  const paw = new THREE.Group();

  const padGeo = new THREE.SphereGeometry(0.068 * scale, 20, 16);
  const pad = new THREE.Mesh(padGeo, furMat);
  pad.scale.set(1.05, 0.58, 1.22);
  pad.position.set(0, -0.04 * scale, 0.015 * scale);
  pad.castShadow = true;
  paw.add(pad);

  const toeGeo = new THREE.SphereGeometry(0.031 * scale, 16, 12);
  for (let i = -1; i <= 1; i += 1) {
    const toe = new THREE.Mesh(toeGeo, creamMat);
    const centerBoost = i === 0 ? 0.014 * scale : 0;
    toe.scale.set(0.92, 0.78, 1.28);
    toe.position.set(
      i * 0.042 * scale,
      -0.056 * scale,
      0.068 * scale + centerBoost,
    );
    toe.castShadow = true;
    paw.add(toe);
  }

  return paw;
}

function buildTaperedLimbGeometry(
  curve: THREE.CatmullRomCurve3,
  radiusAt: (t: number) => { rx: number; rz: number },
  rings = 24,
  segs = 22,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const right = new THREE.Vector3(1, 0, 0);
  const normal = new THREE.Vector3();

  for (let r = 0; r <= rings; r += 1) {
    const t = r / rings;
    const pt = curve.getPoint(t);
    const tan = curve.getTangent(t).normalize();
    normal.crossVectors(right, tan).normalize();
    const { rx, rz } = radiusAt(t);

    for (let s = 0; s <= segs; s += 1) {
      const u = s / segs;
      const a = u * Math.PI * 2;
      const px = pt.x + right.x * Math.cos(a) * rx + normal.x * Math.sin(a) * rz;
      const py = pt.y + right.y * Math.cos(a) * rx + normal.y * Math.sin(a) * rz;
      const pz = pt.z + right.z * Math.cos(a) * rx + normal.z * Math.sin(a) * rz;
      positions.push(px, py, pz);
      uvs.push(u, t);
    }
  }

  const stride = segs + 1;
  for (let r = 0; r < rings; r += 1) {
    for (let s = 0; s < segs; s += 1) {
      const a = r * stride + s;
      const b = a + stride;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function makeFrontLeg(
  side: number,
  furMat: THREE.Material,
  creamMat: THREE.Material,
): { leg: THREE.Group; paw: THREE.Group } {
  const leg = new THREE.Group();

  // Smoothly tucked shoulder top blending organically into the chest/shoulders
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-side * 0.055, 0.02, -0.045),
    new THREE.Vector3(side * 0.005, -0.18, -0.02),
    new THREE.Vector3(side * 0.005, -0.44, 0.005),
    new THREE.Vector3(0, -0.66, 0.025),
  ]);

  const legGeo = buildTaperedLimbGeometry(curve, (t) => {
    const topRound = smoothstep(0.0, 0.32, t) * 0.65 + 0.35;
    const elbowSwell = Math.exp(-((t - 0.3) ** 2) / 0.05) * 0.016;
    const rx = (0.092 - t * 0.034 + elbowSwell) * topRound;
    const rz = (0.106 - t * 0.042 + elbowSwell) * topRound;
    return { rx, rz };
  });

  const legMesh = new THREE.Mesh(legGeo, furMat);
  legMesh.castShadow = true;
  leg.add(legMesh);

  const paw = makeSculptedPaw(furMat, creamMat, 1.0);
  paw.position.set(0, -0.66, 0.025);
  leg.add(paw);

  return { leg, paw };
}

function makeSeatedHindLeg(
  side: number,
  furMat: THREE.Material,
  furDarkMat: THREE.Material,
  creamMat: THREE.Material,
): THREE.Group {
  const hind = new THREE.Group();

  const thigh = new THREE.Mesh(new THREE.SphereGeometry(0.165, 24, 18), furDarkMat);
  thigh.scale.set(0.72, 1.08, 1.22);
  thigh.position.set(side * 0.01, 0.22, -0.02);
  thigh.rotation.x = 0.32;
  thigh.castShadow = true;
  hind.add(thigh);

  const hockCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(side * 0.01, 0.18, -0.08),
    new THREE.Vector3(side * 0.01, 0.085, -0.01),
    new THREE.Vector3(0, 0.045, 0.17),
  ]);
  const hockGeo = buildTaperedLimbGeometry(
    hockCurve,
    (t) => {
      const r = THREE.MathUtils.lerp(0.084, 0.056, t);
      return { rx: r, rz: r * 1.08 };
    },
    18,
    16,
  );
  const hock = new THREE.Mesh(hockGeo, furMat);
  hock.castShadow = true;
  hind.add(hock);

  const ankle = new THREE.Mesh(new THREE.SphereGeometry(0.056, 14, 12), furMat);
  ankle.position.set(0, 0.052, 0.155);
  ankle.castShadow = true;
  hind.add(ankle);

  const paw = makeSculptedPaw(furMat, creamMat, 0.96);
  paw.position.set(0, 0.077, 0.16);
  hind.add(paw);

  return hind;
}

function makeTail(furMat: THREE.Material, creamMat: THREE.Material) {
  const group = new THREE.Group();

  const buildTaperedSegment = (
    curve: THREE.CatmullRomCurve3,
    rStart: number,
    rEnd: number,
    mat: THREE.Material,
  ): THREE.Mesh => {
    const rings = 18;
    const segs = 16;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const right = new THREE.Vector3(1, 0, 0);
    const normal = new THREE.Vector3();

    for (let r = 0; r <= rings; r += 1) {
      const t = r / rings;
      const pt = curve.getPoint(t);
      const tan = curve.getTangent(t).normalize();
      normal.crossVectors(right, tan).normalize();
      const rad = THREE.MathUtils.lerp(rStart, rEnd, t);

      for (let s = 0; s <= segs; s += 1) {
        const u = s / segs;
        const a = u * Math.PI * 2;
        const px = pt.x + right.x * Math.cos(a) * rad + normal.x * Math.sin(a) * rad;
        const py = pt.y + right.y * Math.cos(a) * rad + normal.y * Math.sin(a) * rad;
        const pz = pt.z + right.z * Math.cos(a) * rad + normal.z * Math.sin(a) * rad;
        positions.push(px, py, pz);
        uvs.push(u, t);
      }
    }

    const stride = segs + 1;
    for (let r = 0; r < rings; r += 1) {
      for (let s = 0; s < segs; s += 1) {
        const a = r * stride + s;
        const b = a + stride;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }

    const tipIdx = positions.length / 3;
    const endPt = curve.getPoint(1);
    positions.push(endPt.x, endPt.y, endPt.z);
    uvs.push(0.5, 1);
    const topStart = rings * stride;
    for (let s = 0; s < segs; s += 1) {
      indices.push(tipIdx, topStart + s + 1, topStart + s);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    return m;
  };

  const seg1 = buildTaperedSegment(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.08, -0.14),
      new THREE.Vector3(0, 0.22, -0.22),
    ]),
    0.072,
    0.056,
    furMat,
  );
  group.add(seg1);

  const seg2 = buildTaperedSegment(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.12, -0.04),
      new THREE.Vector3(0, 0.24, 0.03),
    ]),
    0.056,
    0.024,
    furMat,
  );
  seg2.position.set(0, 0.22, -0.22);
  seg1.add(seg2);

  const joint = new THREE.Mesh(new THREE.SphereGeometry(0.056, 14, 12), furMat);
  joint.castShadow = true;
  seg2.add(joint);

  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.032, 14, 12), creamMat);
  tip.scale.set(0.9, 1.25, 0.9);
  tip.position.set(0, 0.24, 0.03);
  tip.castShadow = true;
  seg2.add(tip);

  return { group, seg1, seg2 };
}

export function buildSculpturalDog(): DogRig {
  const root = new THREE.Group();
  root.name = "companionDog";
  root.scale.setScalar(1.06);

  const textures: THREE.Texture[] = [];
  const trackTex = <T extends THREE.Texture>(t: T): T => {
    textures.push(t);
    return t;
  };

  const furTex = createFurTextures(FUR_BASE, "#f2c48a", "#c67f40", 101, 2, 2);
  const furDarkTex = createFurTextures(FUR_DARK_BASE, "#e3a664", "#b36d32", 202, 2, 2);
  const creamTex = createFurTextures(CREAM_BASE, "#fff6e8", "#e5c8a2", 303, 2, 2);
  const headMap = trackTex(createHeadFurMap(404));
  const bodyMap = trackTex(createBodyFurMap(505));
  const noseBump = trackTex(createNoseBumpTexture());
  const metalTex = trackTex(createBrushedMetalTexture());

  trackTex(furTex.map);
  trackTex(furTex.bumpMap);
  trackTex(furTex.roughnessMap);
  trackTex(furDarkTex.map);
  trackTex(furDarkTex.bumpMap);
  trackTex(furDarkTex.roughnessMap);
  trackTex(creamTex.map);
  trackTex(creamTex.bumpMap);
  trackTex(creamTex.roughnessMap);

  const fur = new THREE.MeshStandardMaterial({
    map: furTex.map,
    bumpMap: furTex.bumpMap,
    bumpScale: 0.018,
    roughnessMap: furTex.roughnessMap,
    roughness: 0.86,
    metalness: 0.02,
  });

  const furDark = new THREE.MeshStandardMaterial({
    map: furDarkTex.map,
    bumpMap: furDarkTex.bumpMap,
    bumpScale: 0.018,
    roughnessMap: furDarkTex.roughnessMap,
    roughness: 0.88,
    metalness: 0.02,
  });

  const cream = new THREE.MeshStandardMaterial({
    map: creamTex.map,
    bumpMap: creamTex.bumpMap,
    bumpScale: 0.015,
    roughnessMap: creamTex.roughnessMap,
    roughness: 0.84,
    metalness: 0.02,
  });

  const jawMat = new THREE.MeshStandardMaterial({
    color: JAW_TINT,
    bumpMap: furTex.bumpMap,
    bumpScale: 0.014,
    roughnessMap: furTex.roughnessMap,
    roughness: 0.85,
    metalness: 0.02,
  });

  const bodyMat = new THREE.MeshStandardMaterial({
    map: bodyMap,
    bumpMap: furTex.bumpMap,
    bumpScale: 0.018,
    roughnessMap: furTex.roughnessMap,
    roughness: 0.86,
    metalness: 0.02,
    vertexColors: true,
  });

  const headMat = new THREE.MeshStandardMaterial({
    map: headMap,
    bumpMap: furTex.bumpMap,
    bumpScale: 0.016,
    roughnessMap: furTex.roughnessMap,
    roughness: 0.85,
    metalness: 0.02,
    vertexColors: true,
  });

  const noseMat = new THREE.MeshStandardMaterial({
    color: NOSE_HEX,
    bumpMap: noseBump,
    bumpScale: 0.007,
    roughness: 0.14,
    metalness: 0.08,
  });

  const eyeMat = new THREE.MeshStandardMaterial({
    color: PUPIL_HEX,
    roughness: 0.04,
    metalness: 0.14,
  });

  const irisMat = new THREE.MeshStandardMaterial({
    color: EYE_IRIS_HEX,
    roughness: 0.1,
    metalness: 0.08,
  });

  const collarMat = new THREE.MeshStandardMaterial({
    color: COLLAR_HEX,
    bumpMap: metalTex,
    bumpScale: 0.004,
    roughness: 0.42,
    metalness: 0.06,
  });

  const tagMat = new THREE.MeshStandardMaterial({
    color: TAG_HEX,
    bumpMap: metalTex,
    bumpScale: 0.005,
    roughnessMap: metalTex,
    roughness: 0.28,
    metalness: 0.78,
  });

  const tongueMat = new THREE.MeshStandardMaterial({
    color: TONGUE_HEX,
    roughness: 0.36,
    metalness: 0.02,
  });

  const smileMat = new THREE.MeshStandardMaterial({
    color: 0x2b1a12,
    roughness: 0.45,
    metalness: 0.02,
  });

  // Body pivoted at seated pelvis (y = 0.28, z = -0.22)
  const body = new THREE.Group();
  body.position.set(0, 0.28, -0.22);
  root.add(body);

  // Continuous sculpted torso + chest + flared plush neck
  const torsoMesh = new THREE.Mesh(buildLoftedTorsoGeometry(), bodyMat);
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  body.add(torsoMesh);

  // Sky Blue collar wrapping snugly around the base of the neck (hides head-to-body pivot cleanly)
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.196, 0.032, 16, 40), collarMat);
  collar.position.set(0, 0.655, 0.342);
  collar.rotation.x = Math.PI / 2 - 0.22;
  collar.castShadow = true;
  body.add(collar);

  // Small brass collar ring + brushed brass tag hanging cleanly in front of the chest
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.005, 10, 20), tagMat);
  ring.position.set(0, 0.605, 0.568);
  body.add(ring);

  const tag = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.014, 28), tagMat);
  tag.rotation.x = Math.PI / 2 - 0.34;
  tag.position.set(0, 0.552, 0.595);
  tag.castShadow = true;
  body.add(tag);

  // Soft blended shoulder puffs wrapping cleanly around the top of the front legs
  const shoulderGeo = new THREE.SphereGeometry(0.105, 18, 14);
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Mesh(shoulderGeo, fur);
    shoulder.scale.set(0.82, 1.25, 1.05);
    shoulder.position.set(side * 0.142, 0.41, 0.275);
    shoulder.castShadow = true;
    body.add(shoulder);
  }

  // Head pivoted at top of plush neck (crown reaches world y ~ 1.62, right near Tier 2!)
  const head = new THREE.Group();
  head.position.set(0, 0.78, 0.34);
  body.add(head);

  const skullMesh = new THREE.Mesh(buildSculptedHeadGeometry(), headMat);
  skullMesh.castShadow = true;
  skullMesh.receiveShadow = true;
  head.add(skullMesh);

  // Evaluate exact surface positions for eyes and nose
  const eyeDirL = new THREE.Vector3(-0.42, 0.11, 0.86).normalize();
  const eyeSurfL = evalHeadPoint(eyeDirL.x, eyeDirL.y, eyeDirL.z);
  const eyeDirR = new THREE.Vector3(0.42, 0.11, 0.86).normalize();
  const eyeSurfR = evalHeadPoint(eyeDirR.x, eyeDirR.y, eyeDirR.z);

  const noseDir = new THREE.Vector3(0, -0.2, 0.98).normalize();
  const noseSurf = evalHeadPoint(noseDir.x, noseDir.y, noseDir.z);

  // Warm golden-cream lower jaw tucked neatly back/up into the muzzle (no white pill!)
  const jaw = new THREE.Group();
  jaw.position.set(0, 0.092, 0.145);
  const jawMesh = new THREE.Mesh(new THREE.SphereGeometry(0.068, 20, 16), jawMat);
  jawMesh.scale.set(0.78, 0.42, 0.96);
  jawMesh.position.set(0, -0.004, 0.058);
  jawMesh.castShadow = true;
  jaw.add(jawMesh);

  const tongue = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), tongueMat);
  tongue.scale.set(0.82, 0.28, 1.1);
  tongue.position.set(0, 0.01, 0.075);
  tongue.rotation.x = 0.14;
  jaw.add(tongue);
  head.add(jaw);

  // Wet glossy dark nose sitting cleanly at the tip of the sculpted snout
  const nose = new THREE.Mesh(buildSculptedNoseGeometry(), noseMat);
  nose.position.set(0, noseSurf.y + 0.004, noseSurf.z + 0.006);
  nose.castShadow = true;
  head.add(nose);

  // Delicate friendly smile crease tucked cleanly along the lip line
  const smileCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.044, noseSurf.y - 0.03, noseSurf.z - 0.062),
    new THREE.Vector3(-0.02, noseSurf.y - 0.042, noseSurf.z - 0.03),
    new THREE.Vector3(0, noseSurf.y - 0.032, noseSurf.z - 0.02),
    new THREE.Vector3(0.02, noseSurf.y - 0.042, noseSurf.z - 0.03),
    new THREE.Vector3(0.044, noseSurf.y - 0.03, noseSurf.z - 0.062),
  ]);
  const smile = new THREE.Mesh(new THREE.TubeGeometry(smileCurve, 20, 0.0032, 8, false), smileMat);
  head.add(smile);

  // Bright, round, expressive eyes seated deeply in the sockets with warm amber-chestnut iris & catchlights
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const makeEye = (surf: { x: number; y: number; z: number }, rotY: number): THREE.Mesh => {
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.052, 24, 20), irisMat);
    iris.scale.set(1, 1, 0.76);
    iris.position.set(surf.x, surf.y, surf.z - 0.036);
    iris.rotation.y = rotY;

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.036, 20, 16), eyeMat);
    pupil.scale.set(1, 1, 0.72);
    pupil.position.set(0, 0, 0.028);
    iris.add(pupil);

    const catchMain = new THREE.Mesh(new THREE.SphereGeometry(0.0145, 12, 10), whiteMat);
    catchMain.position.set(0.015, 0.017, 0.046);
    const catchSub = new THREE.Mesh(new THREE.SphereGeometry(0.007, 10, 8), whiteMat);
    catchSub.position.set(-0.014, -0.014, 0.047);
    iris.add(catchMain, catchSub);

    return iris;
  };

  const eyeL = makeEye(eyeSurfL, -0.26);
  const eyeR = makeEye(eyeSurfR, 0.26);
  head.add(eyeL, eyeR);

  // High-resting upper eyelids so eyes look bright, round, and alert (squinting happily on Beat 3)
  const lidGeo = new THREE.SphereGeometry(0.0545, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const lidL = new THREE.Mesh(lidGeo, fur);
  lidL.scale.set(1, 1, 0.78);
  lidL.position.set(eyeSurfL.x, eyeSurfL.y, eyeSurfL.z - 0.036);
  lidL.rotation.set(-1.24, -0.26, 0);
  const lidR = new THREE.Mesh(lidGeo, fur);
  lidR.scale.set(1, 1, 0.78);
  lidR.position.set(eyeSurfR.x, eyeSurfR.y, eyeSurfR.z - 0.036);
  lidR.rotation.set(-1.24, 0.26, 0);
  head.add(lidL, lidR);

  // Smooth forehead (keep browL/browR groups on DogRig without floating brow pills)
  const browL = new THREE.Group();
  const browR = new THREE.Group();
  browL.position.set(eyeSurfL.x, eyeSurfL.y + 0.06, eyeSurfL.z - 0.02);
  browR.position.set(eyeSurfR.x, eyeSurfR.y + 0.06, eyeSurfR.z - 0.02);
  head.add(browL, browR);

  // Fuller, plush rounded draped floppy ears framing the cheeks
  const earL = new THREE.Group();
  const earR = new THREE.Group();
  earL.position.set(-0.192, 0.225, -0.015);
  earR.position.set(0.192, 0.225, -0.015);
  earL.rotation.y = 0.08;
  earR.rotation.y = -0.08;
  const earMeshL = new THREE.Mesh(buildDrapedEarGeometry(-1), furDark);
  const earMeshR = new THREE.Mesh(buildDrapedEarGeometry(1), furDark);
  earMeshL.castShadow = true;
  earMeshR.castShadow = true;
  earL.add(earMeshL);
  earR.add(earMeshR);
  head.add(earL, earR);

  // Front legs blended smoothly into the chest/shoulders (paws rest at y = 0.000)
  const frontL = makeFrontLeg(-1, fur, cream);
  const frontR = makeFrontLeg(1, fur, cream);
  frontL.leg.position.set(-0.142, 0.46, 0.29);
  frontR.leg.position.set(0.142, 0.46, 0.29);
  body.add(frontL.leg, frontR.leg);

  // Seated hind legs anchored cleanly on root at y = 0
  const hindL = makeSeatedHindLeg(-1, fur, furDark, cream);
  const hindR = makeSeatedHindLeg(1, fur, furDark, cream);
  hindL.position.set(-0.205, 0, -0.22);
  hindR.position.set(0.205, 0, -0.22);
  root.add(hindL, hindR);

  // Smooth curved wagging tail
  const tail = makeTail(furDark, cream);
  tail.group.position.set(0, 0.02, -0.28);
  body.add(tail.group);

  return {
    root,
    body,
    head,
    earL,
    earR,
    browL,
    browR,
    lidL,
    lidR,
    jaw,
    tail: tail.group,
    tailSeg1: tail.seg1,
    tailSeg2: tail.seg2,
    pawFL: frontL.paw,
    pawFR: frontR.paw,
    legFL: frontL.leg,
    legFR: frontR.leg,
    tag,
    mats: {
      fur,
      furDark,
      cream,
      nose: noseMat,
      eye: eyeMat,
      collar: collarMat,
      tag: tagMat,
    },
    disposeTextures: () => {
      for (const tex of textures) {
        tex.dispose();
      }
      jawMat.dispose();
      bodyMat.dispose();
      headMat.dispose();
      tongueMat.dispose();
      smileMat.dispose();
      irisMat.dispose();
      whiteMat.dispose();
    },
  };
}

const KEYS = [
  "bY",
  "bP",
  "bR",
  "hP",
  "hT",
  "ear",
  "brow",
  "squint",
  "jaw",
  "wag",
  "lift",
  "paw",
] as const;
type Pose = Record<(typeof KEYS)[number], number>;

const BEATS: Pose[] = [
  [0.28, 0.01, 0, 0.04, 0.04, 0.15, 0.05, 0.02, 0.01, 0.85, 0, 0],
  [0.28, 0.02, 0.02, -0.04, 0.24, 0.75, 0.35, 0.02, 0.08, 1.9, 0.08, 0],
  [0.275, 0.05, -0.03, -0.08, -0.14, 0.95, 0.45, 0.08, 0.2, 3.1, 0.78, 0.12],
  [0.28, 0.02, 0.03, 0.08, -0.18, 0.35, 0.1, 0.78, 0.03, 1.35, 0.04, 0],
].map((r) => Object.fromEntries(KEYS.map((k, i) => [k, r[i]])) as Pose);

function beatAt(progress: number): Pose {
  const p = Math.max(0, Math.min(1, progress)) * 3;
  const i = Math.min(2, Math.floor(p));
  const j = Math.min(3, i + 1);
  let t = p - i;
  t = t * t * (3 - 2 * t);
  const out = {} as Pose;
  for (const k of KEYS) out[k] = BEATS[i][k] + (BEATS[j][k] - BEATS[i][k]) * t;
  return out;
}

export function applyDogPose(
  rig: DogRig,
  progress: number,
  time: number,
  reducedMotion = false,
): void {
  const p = beatAt(progress);
  const speed = reducedMotion ? p.wag * 0.18 : p.wag;
  const amp = reducedMotion ? 0.1 : 0.36;
  const breathe = reducedMotion ? 0 : Math.sin(time * 1.4) * 0.007;

  rig.body.position.y = p.bY + breathe;
  rig.body.rotation.x = p.bP;
  rig.body.rotation.z = p.bR;

  rig.head.rotation.x = p.hP + (reducedMotion ? 0 : Math.sin(time * 1.4 - 0.4) * 0.015);
  rig.head.rotation.z = p.hT;
  rig.jaw.rotation.x = p.jaw;

  const earFlutter = reducedMotion ? 0 : Math.sin(time * 2.1) * 0.018;
  rig.earL.rotation.z = -0.03 - p.ear * 0.14 + earFlutter;
  rig.earR.rotation.z = 0.03 + p.ear * 0.14 - earFlutter;
  rig.earL.rotation.x = rig.earR.rotation.x = -p.ear * 0.12;

  rig.browL.rotation.z = 0.12 * p.brow;
  rig.browR.rotation.z = -0.12 * p.brow;

  const blink =
    reducedMotion
      ? 0
      : Math.pow(Math.max(0, Math.sin(time * 0.85)), 28) * 0.85;
  const squint = Math.max(
    reducedMotion ? Math.min(p.squint, 0.35) : p.squint,
    blink,
  );
  rig.lidL.rotation.x = -1.24 + squint * 1.38;
  rig.lidR.rotation.x = -1.24 + squint * 1.38;

  const wag = Math.sin(time * speed * 2.2) * amp;
  rig.tail.rotation.z = wag * 0.45;
  rig.tail.rotation.x = -p.lift * 0.25;
  rig.tailSeg1.rotation.z = wag * 0.75;
  rig.tailSeg2.rotation.z = Math.sin(time * speed * 2.2 - 0.65) * amp * 0.85;

  const shoulderDrop = breathe + Math.sin(p.bP) * 0.36;
  const lift = reducedMotion ? p.lift * 0.4 : p.lift;

  rig.legFR.position.y = 0.46 - shoulderDrop;
  rig.legFR.rotation.x = -p.bP - p.paw * 0.35;
  rig.pawFR.rotation.x = p.paw * 0.25;

  rig.legFL.position.y = 0.46 - shoulderDrop * (1 - lift);
  rig.legFL.rotation.x =
    -p.bP * (1 - lift) -
    lift * 0.88 +
    (reducedMotion ? 0 : Math.sin(time * 2.4) * 0.04 * lift);
  rig.pawFL.rotation.x = lift * 0.52;

  rig.tag.rotation.z = reducedMotion
    ? 0
    : Math.sin(time * (speed * 2.0 + 0.5)) * 0.14;
}
