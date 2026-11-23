import * as THREE from "three";

export const SHELL_COLORS = [
  { id: "blush", name: "Blush Pink", hex: "#F6D1D8" },
  { id: "mint", name: "Seafoam Mint", hex: "#BFE3DC" },
  { id: "oat", name: "Warm Oat Cream", hex: "#FAF6F0" },
];

export type PartKey = "scratch" | "lick" | "seesaw" | "paddle" | "wheel" | "scent";

export const SKY = 0x4da8da;
export const BUTTER = 0xf4d35e;
export const CREAM = 0xf3e9d8;
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
    roughness: 0.66,
    metalness: 0.03,
    ...opts,
  });
}

export function createGritBumpTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  const image = ctx.getImageData(0, 0, size, size);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = 118 + Math.random() * 20;
    data[i] = data[i + 1] = data[i + 2] = grain;
    data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);

  for (let i = 0; i < size * 14; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const bright = Math.random() > 0.5;
    ctx.fillStyle = bright
      ? `rgba(235,235,235,${0.15 + Math.random() * 0.4})`
      : `rgba(35,35,35,${0.15 + Math.random() * 0.4})`;
    const r = Math.random() < 0.85 ? 0.6 : 1.3;
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

export type ChamferedOctagonOptions = {
  width?: number;
  height?: number;
  chamfer?: number;
  bevel?: number;
  bevelTaper?: number;
  flare?: number;
  segments?: number;
  rings?: number;
};

function smoothMin(a: number, b: number, k: number) {
  const h = Math.max(0, Math.min(1, 0.5 + (0.5 * (b - a)) / k));
  return b * (1 - h) + a * h - k * h * (1 - h);
}

export function chamferedOctagonGeometry(
  options: ChamferedOctagonOptions = {},
): THREE.BufferGeometry {
  const width = options.width ?? 1;
  const height = options.height ?? 2.6;
  const chamfer = options.chamfer ?? 0.55;
  const bevel = options.bevel ?? 0.08;
  const bevelTaper = options.bevelTaper ?? 0.12;
  const flare = options.flare ?? 0;
  const segments = options.segments ?? 96;
  const rings = options.rings ?? 14;

  const diamond = width + chamfer;
  const fillet = width * 0.06;
  const ease = (x: number) => x * x * (3 - 2 * x);

  const profileScale = (t: number) => {
    let s = 1;
    if (bevel > 0) {
      const bottom = ease(Math.min(t / bevel, 1));
      const top = ease(Math.min((1 - t) / bevel, 1));
      s *= 1 - bevelTaper * (1 - Math.min(bottom, top));
    }
    if (flare > 0) s *= 1 + flare * Math.pow(1 - t, 3);
    return s;
  };

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let r = 0; r <= rings; r++) {
    const t = r / rings;
    const y = t * height;
    const scale = profileScale(t);
    for (let s = 0; s <= segments; s++) {
      const u = s / segments;
      const a = u * Math.PI * 2;
      const c = Math.abs(Math.cos(a));
      const sn = Math.abs(Math.sin(a));
      const squareR = width / Math.max(c, sn);
      const diamondR = diamond / (c + sn);
      const radius = smoothMin(squareR, diamondR, fillet) * scale;
      positions.push(Math.cos(a) * radius, y, Math.sin(a) * radius);
      uvs.push(u, t);
    }
  }

  const stride = segments + 1;
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const a = r * stride + s;
      const b = a + stride;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const bottomCenter = positions.length / 3;
  positions.push(0, 0, 0);
  uvs.push(0.5, 0.5);
  const topCenter = positions.length / 3;
  positions.push(0, height, 0);
  uvs.push(0.5, 0.5);

  const topRingStart = rings * stride;
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
