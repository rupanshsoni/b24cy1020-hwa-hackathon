"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { useStore } from "@/store/StoreContext";

const SKY = 0x4da8da;
const BUTTER = 0xf4d35e;
const OAT = 0xfaf6f0;
const BLUSH = 0xf6d1d8;
const MINT = 0xbfe3dc;
const COCOA = 0x2b2623;

function roundedBox(w: number, h: number, d: number, r = 0.12) {
  return new RoundedBoxGeometry(w, h, d, 4, r);
}

function mat(color: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.02, ...opts });
}

type DogRig = {
  group: THREE.Group;
  earL: THREE.Group;
  earR: THREE.Group;
  tail: THREE.Group;
  head: THREE.Group;
};

function buildDog(): DogRig {
  const group = new THREE.Group();
  const fur = mat(0xe7b98d);
  const furLight = mat(0xf5ddc2);
  const dark = mat(COCOA);

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 24), fur);
  body.scale.set(1.15, 0.86, 0.86);
  body.position.set(0, 0.72, 0);
  body.castShadow = true;
  group.add(body);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 18), furLight);
  chest.position.set(0.5, 0.62, 0.28);
  chest.scale.set(0.9, 1.1, 0.7);
  group.add(chest);

  const head = new THREE.Group();
  head.position.set(0.56, 1.32, 0.05);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), fur);
  skull.castShadow = true;
  head.add(skull);

  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 18), furLight);
  muzzle.position.set(0.34, -0.1, 0.02);
  muzzle.scale.set(1.15, 0.8, 0.85);
  head.add(muzzle);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), dark);
  nose.position.set(0.54, -0.05, 0.02);
  head.add(nose);

  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.052, 16, 12), dark);
    eye.position.set(0.28, 0.1, s * 0.2);
    head.add(eye);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.6 }));
    glint.position.set(0.31, 0.12, s * 0.22);
    head.add(glint);
  }

  const earL = new THREE.Group();
  const earR = new THREE.Group();
  for (const [ear, s] of [[earL, 1], [earR, -1]] as const) {
    ear.position.set(-0.1, 0.3, s * 0.28);
    const flap = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 16), mat(0xc98f63));
    flap.scale.set(0.5, 1.35, 0.75);
    flap.position.y = -0.12;
    flap.castShadow = true;
    ear.add(flap);
    head.add(ear);
  }
  group.add(head);

  for (const [x, z] of [[0.48, 0.42], [0.48, -0.42], [-0.48, 0.42], [-0.48, -0.42]]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.42, 6, 12), fur);
    leg.position.set(x, 0.28, z);
    leg.castShadow = true;
    group.add(leg);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), furLight);
    paw.scale.set(1.1, 0.6, 1);
    paw.position.set(x + 0.05, 0.1, z);
    group.add(paw);
  }

  const tail = new THREE.Group();
  tail.position.set(-0.66, 0.9, 0);
  const tailMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.55, 6, 12), fur);
  tailMesh.position.set(-0.2, 0.28, 0);
  tailMesh.rotation.z = -0.7;
  tailMesh.castShadow = true;
  tail.add(tailMesh);
  group.add(tail);

  group.position.set(-1.9, 0, 1.1);
  group.rotation.y = -0.35;
  return { group, earL, earR, tail, head };
}

type VaultRig = { group: THREE.Group; led: THREE.Mesh; glow: THREE.PointLight };

function buildVault(): VaultRig {
  const group = new THREE.Group();
  const shell = mat(MINT);
  const cream = mat(0xf3e9d8);
  const blue = mat(SKY, { roughness: 0.4 });
  const yellow = mat(BUTTER, { roughness: 0.5 });

  const base = new THREE.Mesh(roundedBox(1.5, 0.55, 1.3, 0.22), cream);
  base.position.y = 0.3;
  base.castShadow = true;
  group.add(base);

  const mid = new THREE.Mesh(roundedBox(1.28, 0.6, 1.12, 0.2), shell);
  mid.position.y = 0.85;
  mid.castShadow = true;
  group.add(mid);

  const top = new THREE.Mesh(roundedBox(1.15, 0.55, 1.0, 0.18), mat(BLUSH));
  top.position.y = 1.4;
  top.castShadow = true;
  group.add(top);

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(0xe8f4f2, { transparent: true, opacity: 0.72, roughness: 0.25 }),
  );
  dome.position.y = 1.68;
  group.add(dome);

  const funnel = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.07, 12, 28), blue);
  funnel.position.set(-0.66, 1.0, 0.2);
  funnel.rotation.y = Math.PI / 2;
  group.add(funnel);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 16), blue);
  ball.position.set(-0.98, 0.18, 0.36);
  group.add(ball);

  const paddle = new THREE.Mesh(roundedBox(0.5, 0.2, 0.14, 0.07), yellow);
  paddle.position.set(0.1, 0.42, 0.7);
  group.add(paddle);

  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.08, 12, 24), mat(BLUSH));
  wheel.position.set(0.62, 0.42, 0.28);
  wheel.rotation.y = Math.PI / 2;
  group.add(wheel);

  const led = new THREE.Mesh(
    roundedBox(0.72, 0.1, 0.06, 0.03),
    new THREE.MeshBasicMaterial({ color: SKY, transparent: true, opacity: 0.95 }),
  );
  led.position.set(0, 0.48, 0.67);
  group.add(led);

  const glow = new THREE.PointLight(SKY, 1.6, 4, 2);
  glow.position.set(0, 0.6, 1.0);
  group.add(glow);

  group.position.set(1.7, 0, 0);
  group.rotation.y = -0.4;
  return { group, led, glow };
}

function buildRoom(scene: THREE.Scene) {
  const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

  const rug = new THREE.Mesh(
    new THREE.CircleGeometry(6, 64),
    mat(0xf0e7d8, { roughness: 1 }),
  );
  rug.rotation.x = -Math.PI / 2;
  rug.receiveShadow = true;
  scene.add(rug);
  disposables.push(rug.geometry, rug.material as THREE.Material);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    mat(0xe9d9c4, { roughness: 1 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.02;
  floor.receiveShadow = true;
  scene.add(floor);
  disposables.push(floor.geometry, floor.material as THREE.Material);

  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), mat(0xf7eee4, { roughness: 1 }));
  wall.position.set(0, 5, -4.2);
  wall.receiveShadow = true;
  scene.add(wall);
  disposables.push(wall.geometry, wall.material as THREE.Material);

  const frame = new THREE.Mesh(roundedBox(2.5, 3.6, 0.18, 0.1), mat(0xe8cdc3));
  frame.position.set(-2.4, 1.8, -4.0);
  scene.add(frame);
  disposables.push(frame.geometry, frame.material as THREE.Material);

  const doorPivot = new THREE.Group();
  doorPivot.position.set(-3.55, 0, -3.88);
  const doorGeo = roundedBox(2.2, 3.4, 0.14, 0.08);
  const door = new THREE.Mesh(doorGeo, mat(0xcf9e94));
  door.position.set(1.1, 1.7, 0);
  door.castShadow = true;
  doorPivot.add(door);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), mat(BUTTER, { metalness: 0.4, roughness: 0.3 }));
  knob.position.set(1.95, 1.7, 0.12);
  doorPivot.add(knob);
  scene.add(doorPivot);
  disposables.push(doorGeo, door.material as THREE.Material, knob.geometry, knob.material as THREE.Material);

  return { doorPivot, disposables };
}

type Wave = { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial };

export default function HeroScene() {
  const { dogName, setDogName } = useStore();
  const wrapRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [nameDraft, setNameDraft] = useState(dogName);
  const [webglFailed, setWebglFailed] = useState(false);
  const pointerProgress = useRef<number | null>(null);
  const progressRef = useRef(0);
  const scrubbing = useRef(false);
  const sceneRef = useRef<{
    dog: DogRig; vault: VaultRig; doorPivot: THREE.Group; waves: Wave[];
    camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer; scene: THREE.Scene;
  } | null>(null);

  useEffect(() => setNameDraft(dogName), [dogName]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const mount = mountRef.current;
    if (!wrap || !mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      setWebglFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 2.8, 8.6);
    camera.lookAt(0, 1.1, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xd8c4ae, 2.1));
    const key = new THREE.DirectionalLight(0xfff3df, 2.4);
    key.position.set(4, 8, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -8; key.shadow.camera.right = 8;
    key.shadow.camera.top = 8; key.shadow.camera.bottom = -8;
    scene.add(key);
    const rim = new THREE.DirectionalLight(SKY, 0.8);
    rim.position.set(-6, 4, -4);
    scene.add(rim);

    const room = buildRoom(scene);
    const dog = buildDog();
    scene.add(dog.group);
    const vault = buildVault();
    scene.add(vault.group);

    const waves: Wave[] = [];
    for (let i = 0; i < 4; i++) {
      const wm = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? SKY : BUTTER, transparent: true, opacity: 0, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.56, 64), wm);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(1.7, 0.05, 0);
      scene.add(ring);
      waves.push({ mesh: ring, mat: wm });
    }

    sceneRef.current = { dog, vault, doorPivot: room.doorPivot, waves, camera, renderer, scene };

    const onScroll = () => {
      if (scrubbing.current || pointerProgress.current !== null) return;
      const rect = wrap.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      progressRef.current = p;
      setProgress(p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    let frame = 0;
    let current = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const target = pointerProgress.current ?? progressRef.current;
      current += (target - current) * 0.08;
      const t = current;
      const elapsed = clock.getElapsedTime();

      room.doorPivot.rotation.y = -1.15 * Math.min(1, t / 0.3);
      const worry = Math.sin(Math.min(1, t / 0.3) * Math.PI) * 0.3;
      dog.head.rotation.z = -0.12 * Math.sin(Math.min(1, t / 0.3) * Math.PI);
      dog.earL.rotation.z = -worry;
      dog.earR.rotation.z = worry;

      const play = Math.max(0, Math.min(1, (t - 0.3) / 0.35));
      waves.forEach((w, i) => {
        const phase = (play * 2.6 + i * 0.25 + elapsed * 0.12) % 1;
        const scale = 0.4 + phase * 5.5;
        w.mesh.scale.setScalar(scale);
        w.mat.opacity = play > 0 && play < 1 ? (1 - phase) * 0.55 * play : 0;
      });
      vault.glow.intensity = 1.6 + play * 2.2 + Math.sin(elapsed * 3) * 0.25;
      (vault.led.material as THREE.MeshBasicMaterial).opacity = 0.7 + 0.3 * Math.sin(elapsed * 4);

      const trot = Math.max(0, Math.min(1, (t - 0.65) / 0.35));
      dog.earL.rotation.z = -worry + trot * 0.45;
      dog.earR.rotation.z = worry - trot * 0.45;
      dog.tail.rotation.z = Math.sin(elapsed * 14) * 0.5 * trot;
      dog.group.position.x = -1.9 + trot * 1.35;
      dog.group.position.z = 1.1 - trot * 0.5;
      dog.group.position.y = Math.abs(Math.sin(elapsed * 9)) * 0.06 * trot;
      dog.group.rotation.y = -0.35 + trot * 0.3;

      camera.position.z = 8.6 - trot * 2.1;
      camera.position.x = trot * 0.9;
      camera.lookAt(trot * 0.8, 1.05, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      sceneRef.current = null;
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          materials.forEach((m) => m.dispose());
        }
      });
      room.disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function commitName() {
    const next = nameDraft.trim() || "Bruno";
    setDogName(next);
    setNameDraft(next);
  }

  function onPointer(e: React.PointerEvent<HTMLDivElement>) {
    if (!scrubbing.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointerProgress.current = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    progressRef.current = pointerProgress.current;
    setProgress(pointerProgress.current);
  }

  const headline = progress < 0.3
    ? "You leave for 8 hours. Most dog toys last 12 minutes."
    : progress < 0.65
      ? `PawVault keeps ${dogName} company, all day long.`
      : "Come home to a calm, happy dog.";

  return (
    <section ref={wrapRef} className="relative h-[240vh] sm:h-[260vh]">
      <div className="sticky top-0 flex h-[calc(100vh-72px)] min-h-[620px] items-center overflow-hidden">
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-blush/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-mint/50 blur-3xl" />

        <div className="section-shell relative grid w-full items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="z-10 order-2 lg:order-1">
            <span className="chip bg-white/80">A full workday of calm</span>
            <h1 className="display-title mt-5 max-w-xl">{headline}</h1>
            <p className="mt-5 max-w-lg leading-relaxed text-cocoa/70">
              A weighted, chew-proof enrichment vault that stages five dog-IQ puzzles across 4–6 hours — so the good kind of busy lasts until you&apos;re home.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <label htmlFor="hero-dog-name" className="text-sm font-semibold">Your dog&apos;s name</label>
              <input
                id="hero-dog-name"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => { if (e.key === "Enter") commitName(); }}
                className="w-36 rounded-full border border-cocoa/15 bg-white/80 px-4 py-2 text-sm outline-none focus:border-sky"
              />
              <span className="text-xs text-cocoa/50">synced with your configurator</span>
            </div>

            {progress >= 0.3 && progress < 0.68 && (
              <div className="fade-up mt-5 inline-flex items-center gap-3 rounded-2xl border border-sky/30 bg-white/85 px-5 py-3 shadow-soft">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-sky/20 text-lg">🔊</span>
                <div>
                  <p className="text-xs text-cocoa/50">Owner voice callout</p>
                  <p className="font-display text-lg font-bold">&ldquo;Come {dogName}, it&apos;s time to play!&rdquo;</p>
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="#how-it-works" className="btn-primary">Explore the Vault →</Link>
              <Link href="#configure" className="btn-ghost">Shop Now</Link>
            </div>
          </div>

          <div className="relative order-1 h-[45vh] min-h-[340px] lg:order-2 lg:h-[78vh]">
            <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />
            {webglFailed && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="overflow-hidden rounded-4xl border border-white/70 bg-white shadow-soft">
                  <img src="/images/pawvault-smart-hero.webp" alt="PawVault Smart vault" className="h-full max-h-[60vh] w-auto object-contain" />
                </div>
              </div>
            )}

            <div
              className="absolute bottom-2 left-1/2 z-10 w-[min(92%,440px)] -translate-x-1/2 cursor-pointer rounded-full border border-cocoa/10 bg-white/80 px-4 py-2.5 backdrop-blur"
              onPointerDown={(e) => { scrubbing.current = true; e.currentTarget.setPointerCapture(e.pointerId); onPointer(e); }}
              onPointerMove={onPointer}
              onPointerUp={(e) => { scrubbing.current = false; pointerProgress.current = null; e.currentTarget.releasePointerCapture(e.pointerId); }}
              onPointerCancel={() => { scrubbing.current = false; pointerProgress.current = null; }}
              role="slider"
              aria-label="Preview story stages"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  const step = e.key === "ArrowRight" ? 0.1 : -0.1;
                  const p = Math.min(1, Math.max(0, progress + step));
                  pointerProgress.current = p;
                  progressRef.current = p;
                  setProgress(p);
                  window.setTimeout(() => { pointerProgress.current = null; }, 1500);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-cocoa/50">Scrub</span>
                <div className="relative h-1.5 flex-1 rounded-full bg-cocoa/10">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-sky" style={{ width: `${progress * 100}%` }} />
                  {[0.3, 0.65].map((m) => (
                    <span key={m} className="absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 bg-white" style={{ left: `${m * 100}%` }} />
                  ))}
                </div>
                <span className="shrink-0 text-[10px] font-bold text-cocoa/50">{Math.round(progress * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
