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
  mats: Record<"fur" | "furDark" | "cream" | "nose" | "eye" | "collar" | "tag", THREE.MeshStandardMaterial>;
}

const FUR = 0xe7b98d, FUR_DARK = 0xc98f63, CREAM = 0xf5ddc2;
const NOSE = 0x2a1a12, COLLAR = 0x4da8da, TAG = 0xf4d35e;
const mat = (c: number, rough = 0.78, metal = 0.02) =>
  new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: metal });
const lathe = (pts: number[][], seg = 36) =>
  new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);
const mesh = (g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
  const o = new THREE.Mesh(g, m);
  o.position.set(x, y, z);
  o.castShadow = true;
  return o;
};
const bead = (r: number, m: THREE.Material, x = 0, y = 0, z = 0) =>
  mesh(new THREE.SphereGeometry(r, 20, 16), m, x, y, z);

function makeEar(m: THREE.Material, flip: number): THREE.Group {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.06 * flip, 0.1, 0.1 * flip, 0.26, 0.02 * flip, 0.34);
  s.bezierCurveTo(-0.04 * flip, 0.4, -0.13 * flip, 0.36, -0.14 * flip, 0.24);
  s.bezierCurveTo(-0.15 * flip, 0.12, -0.08 * flip, 0.03, 0, 0);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.045, bevelEnabled: true, bevelThickness: 0.025,
    bevelSize: 0.022, bevelSegments: 4, curveSegments: 16,
  });
  g.center();
  const grp = new THREE.Group();
  grp.add(mesh(g, m));
  return grp;
}

function makeLeg(m: THREE.Material, cream: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh(lathe([[0.001, 0.18], [0.055, 0.16], [0.062, 0.06], [0.05, -0.02], [0.058, -0.09], [0.001, -0.11]]), m));
  const paw = new THREE.Group();
  const pad = bead(0.062, m, 0, -0.09, 0);
  pad.scale.set(1, 0.62, 1.25);
  paw.add(pad);
  for (let i = -1; i <= 1; i++) paw.add(bead(0.026, cream, i * 0.036, -0.112, 0.05));
  paw.position.y = -0.06;
  g.add(paw);
  g.add(bead(0.105, m, 0, 0.16, 0));
  return g;
}

function makeTail(m: THREE.Material) {
  const group = new THREE.Group();
  const seg1 = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.02, 0.09, 0.02), new THREE.Vector3(0.06, 0.18, 0.01),
  ]), 18, 0.046, 12, false), m);
  group.add(seg1);
  const seg2 = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.02, 0.08, 0.03), new THREE.Vector3(0, 0.16, 0.07),
  ]), 18, 0.036, 12, false), m);
  seg2.position.set(0.06, 0.18, 0.01);
  group.add(seg2);
  return { group, seg1, seg2 };
}

export function buildSculpturalDog(): DogRig {
  const root = new THREE.Group();
  root.name = "companionDog";
  const fur = mat(FUR), furDark = mat(FUR_DARK), cream = mat(CREAM, 0.72);
  const noseMat = mat(NOSE, 0.18, 0.1), eyeMat = mat(0x14100c, 0.08, 0.25);
  const collarMat = mat(COLLAR, 0.45), tagMat = mat(TAG, 0.32, 0.25);

  const body = new THREE.Group();
  body.position.y = 0.62;
  root.add(body);
  const torso = mesh(lathe([[0.001, -0.34], [0.12, -0.3], [0.2, -0.16], [0.235, 0], [0.22, 0.16], [0.17, 0.31], [0.09, 0.42], [0.001, 0.45]]), fur);
  torso.rotation.set(0, Math.PI / 2, Math.PI / 2);
  torso.scale.set(1, 1.18, 0.72);
  body.add(torso);
  const chest = mesh(lathe([[0.001, 0], [0.1, 0.02], [0.16, 0.12], [0.17, 0.24], [0.001, 0.34]]), cream, 0, -0.04, 0.26);
  chest.rotation.x = -0.35;
  chest.scale.set(0.85, 0.85, 0.5);
  body.add(chest);
  const neck = mesh(lathe([[0.001, 0], [0.16, 0.04], [0.13, 0.2], [0.09, 0.36], [0.001, 0.44]]), fur, 0, 0.12, 0.20);
  neck.rotation.x = -0.5;
  neck.scale.set(1.25, 1, 1.1);
  body.add(neck);
  const collar = mesh(new THREE.TorusGeometry(0.115, 0.028, 12, 36), collarMat, 0, 0.42, 0.28);
  collar.rotation.x = Math.PI / 2 - 0.42;
  body.add(collar);
  const tag = mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.014, 22), tagMat, 0, 0.4, 0.42);
  tag.rotation.x = Math.PI / 2;
  body.add(tag);

  const head = new THREE.Group();
  head.position.set(0, 0.48, 0.32);
  body.add(head);
  const skull = mesh(lathe([[0.001, -0.15], [0.11, -0.1], [0.17, 0], [0.18, 0.1], [0.13, 0.19], [0.001, 0.23]]), fur);
  skull.rotation.x = Math.PI / 2;
  skull.scale.set(1.05, 1, 0.92);
  head.add(skull);
  const muzzle = mesh(lathe([[0.001, 0], [0.075, 0.02], [0.1, 0.09], [0.115, 0.18], [0.001, 0.24]]), cream, 0, -0.05, 0.13);
  muzzle.rotation.x = Math.PI / 2;
  muzzle.scale.set(1.02, 1, 0.72);
  head.add(muzzle);
  const jaw = new THREE.Group();
  jaw.position.set(0, -0.11, 0.2);
  const jawMesh = bead(0.085, cream);
  jawMesh.scale.set(1, 0.55, 0.8);
  jaw.add(jawMesh);
  head.add(jaw);
  const nose = bead(0.052, noseMat, 0, -0.01, 0.29);
  nose.scale.set(1.2, 0.9, 0.9);
  head.add(nose);

  const eyeL = bead(0.048, eyeMat, -0.09, 0.06, 0.135);
  const eyeR = bead(0.048, eyeMat, 0.09, 0.06, 0.135);
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff });
  eyeL.add(bead(0.016, white, 0.015, 0.025, 0.04), bead(0.009, white, -0.015, -0.02, 0.04));
  eyeR.add(bead(0.016, white, 0.015, 0.025, 0.04), bead(0.009, white, -0.015, -0.02, 0.04));
  const lidMat = mat(FUR, 0.85);
  const lidL = bead(0.052, lidMat, -0.09, 0.125, 0.15);
  const lidR = bead(0.052, lidMat, 0.09, 0.125, 0.15);
  lidL.scale.set(1.05, 0.9, 1.05);
  lidR.scale.set(1.05, 0.9, 1.05);
  head.add(eyeL, eyeR, lidL, lidR);

  const browL = new THREE.Group(), browR = new THREE.Group();
  browL.position.set(-0.1, 0.14, 0.16);
  browR.position.set(0.1, 0.14, 0.16);
  const bm = () => new THREE.CapsuleGeometry(0.018, 0.06, 6, 10);
  const bl = mesh(bm(), furDark), br = mesh(bm(), furDark);
  bl.rotation.z = Math.PI / 2 - 0.25;
  br.rotation.z = Math.PI / 2 + 0.25;
  browL.add(bl);
  browR.add(br);
  head.add(browL, browR);

  const earL = makeEar(furDark, 1), earR = makeEar(furDark, -1);
  earL.position.set(-0.15, 0.1, 0.02);
  earR.position.set(0.15, 0.1, 0.02);
  earL.rotation.z = 0.5;
  earR.rotation.z = -0.5;
  head.add(earL, earR);

  const legFL = makeLeg(fur, cream), legFR = makeLeg(fur, cream);
  const legBL = makeLeg(furDark, cream), legBR = makeLeg(furDark, cream);
  legFL.position.set(-0.12, -0.22, 0.22);
  legFR.position.set(0.12, -0.22, 0.22);
  legBL.position.set(-0.13, -0.22, -0.16);
  legBR.position.set(0.13, -0.22, -0.16);
  body.add(legFL, legFR, legBL, legBR);
  const pawFL = legFL.children[1] as THREE.Group;
  const pawFR = legFR.children[1] as THREE.Group;
  const tail = makeTail(furDark);
  tail.group.position.set(0, 0.2, -0.3);
  body.add(tail.group);

  return {
    root, body, head, earL, earR, browL, browR, lidL, lidR, jaw,
    tail: tail.group, tailSeg1: tail.seg1, tailSeg2: tail.seg2,
    pawFL, pawFR, legFL, legFR, tag,
    mats: { fur, furDark, cream, nose: noseMat, eye: eyeMat, collar: collarMat, tag: tagMat },
  };
}

const KEYS = ["bY", "bP", "bR", "hP", "hT", "ear", "brow", "squint", "jaw", "wag", "lift", "paw"] as const;
type Pose = Record<(typeof KEYS)[number], number>;
const BEATS: Pose[] = [
  [0.62, 0.02, 0, 0.22, 0, 0.15, -0.1, 0.1, 0, 0.8, 0, 0],
  [0.62, 0.01, 0, 0.02, 0.42, 0.85, 0.25, 0.05, 0.12, 2.1, 0.1, 0],
  [0.5, -0.32, -0.06, -0.12, -0.18, 1, 0.4, 0.2, 0.32, 3.4, 0.75, 0.35],
  [0.6, 0.06, 0.05, 0.14, -0.28, 0.55, 0.05, 0.82, 0.08, 1.6, 0.08, 0.05],
].map((r) => Object.fromEntries(KEYS.map((k, i) => [k, r[i]])) as Pose);

function beatAt(progress: number): Pose {
  const p = Math.max(0, Math.min(1, progress)) * 4;
  const i = Math.min(3, Math.floor(p));
  const j = Math.min(3, i + 1);
  let t = p - i;
  t = t * t * (3 - 2 * t);
  const out = {} as Pose;
  for (const k of KEYS) out[k] = BEATS[i][k] + (BEATS[j][k] - BEATS[i][k]) * t;
  return out;
}

export function applyDogPose(rig: DogRig, progress: number, time: number, reducedMotion = false): void {
  const p = beatAt(progress);
  const speed = reducedMotion ? p.wag * 0.18 : p.wag;
  const amp = reducedMotion ? 0.12 : 0.42;
  const breathe = reducedMotion ? 0 : Math.sin(time * 1.4) * 0.012;

  rig.body.position.y = p.bY + breathe;
  rig.body.rotation.x = p.bP;
  rig.body.rotation.z = p.bR;
  rig.head.rotation.x = p.hP;
  rig.head.rotation.z = p.hT;
  rig.jaw.rotation.x = p.jaw;

  rig.earL.rotation.z = 0.5 + (1 - p.ear) * 0.55 + (reducedMotion ? 0 : Math.sin(time * 2.3) * 0.02);
  rig.earR.rotation.z = -0.5 - (1 - p.ear) * 0.55 - (reducedMotion ? 0 : Math.sin(time * 2.3 + 0.4) * 0.02);
  rig.earL.rotation.x = rig.earR.rotation.x = -p.ear * 0.2;
  rig.browL.rotation.z = 0.25 * p.brow;
  rig.browR.rotation.z = -0.25 * p.brow;

  const squint = reducedMotion ? Math.min(p.squint, 0.35) : p.squint;
  for (const lid of [rig.lidL, rig.lidR]) {
    lid.position.y = 0.125 - squint * 0.065;
    lid.scale.y = 0.45 + squint * 0.85;
  }

  const wag = Math.sin(time * speed * 2.2) * amp;
  rig.tail.rotation.z = wag * 0.5;
  rig.tail.rotation.x = -p.lift * 0.9;
  rig.tailSeg1.rotation.z = wag;
  rig.tailSeg2.rotation.z = Math.sin(time * speed * 2.2 - 0.7) * amp * 1.4;

  const lift = reducedMotion ? p.lift * 0.4 : p.lift;
  rig.legFL.rotation.x = -lift * 1.15 + (reducedMotion ? 0 : Math.sin(time * 1.8) * 0.01);
  rig.legFR.rotation.x = -p.paw * 0.8;
  rig.pawFL.rotation.x = lift * 0.6;
  rig.tag.rotation.z = reducedMotion ? 0 : Math.sin(time * (speed * 2.2 + 0.5)) * 0.15;
}
