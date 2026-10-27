import { useEffect, useRef, useState } from "react";
import { FONT, EASE } from "./theme.js";

/* ─────────────────────────────────────────────────────────
   THE CAR

   An M5 CS glTF on a canvas that fills the window and sits
   behind everything else on the page. It drives itself in once,
   parks dead centre behind the type, and from then on the scroll
   is a camera track around it.

   Every number here is written in car lengths. The model is
   normalised on load to exactly CAR_LENGTH along +Z, centred on
   the origin, standing on its wheels — so the spline and the six
   shots mean the same thing whatever the file was authored at.

   three.js and the model are a dynamic import, so the rest of the
   site is never waiting on 3MB of geometry to parse.
   ───────────────────────────────────────────────────────── */

const MODEL = "/models/m5cs.glb";
const SHED = "/models/shed.glb";

const CAR_LENGTH = 4.5;            // nose to tail, in world units
const GROUND = -0.5;               // the floor it drives on
const MARK = [0, GROUND, -1.2];    // where it parks
const HERO_LOOK = [0.35, GROUND, 4.0];   // what it faces once parked: a few
                                         // degrees off square

/* How the car arrives. "shutter" is the shed: the lights come up on a car
   already standing there, while the page's own curtain lifts over the top.
   "drive" is the earlier entrance, where it runs in along a spline and
   swings onto its mark. Both are kept because neither is committed yet. */
const ENTRANCE = "shutter";
const INTRO_MS = 4600;
/* The drive in, in the car's hero frame (x to the right of the screen, z
   toward the camera, the mark at the origin). It comes out of the dark on
   the right at speed, runs across the back of the shed, hooks left through
   about 100 degrees sideways, and brakes hard down a short straight onto
   its mark. A Catmull-Rom spline walked by arc length.

   The speed is real-world: it holds DRIFT_V (~35 km/h, about what a shed
   allows) through the corner, then stops with constant deceleration over
   BRAKE_LEN, so the whole run fits between DRIVE_START and DRIVE_END. */
const ARRIVAL = [[11.0, -6.0], [8.6, -6.0], [6.2, -6.0], [3.4, -6.0], [2.52, -5.884], [1.7, -5.544], [0.996, -5.004], [0.456, -4.3], [0.116, -3.48], [0.0, -2.6], [0.0, -1.3], [0.0, 0.0]];
// the drift, by distance along that path: where the flick, the full slide
// and the catch happen (metres from the start)
const TURN_IN = 6.0, FULL_SLIDE = 8.0, UNWIND = 12.4, CAUGHT = 14.6;
const SLIDE = 0.72;        // ~41 degrees of body angle at full slide
const DRIVE_START = 0.08;  // a beat of dark, DRLs only, before it arrives
const DRIVE_END = 0.6;     // stopped on the mark
const BRAKE_LEN = 4.2;     // metres of hard braking at the end

/* The opening move: a low pass off the rear quarter, up and over the carbon
   roof, settling into the hero stance. Written in the car's own frame like
   the tour, so it lands exactly where shot one begins. */
/* Where the push-in starts: well back from the car, out in the haze. */
const FAR = [2.6, 0.32, 8.2];   // down on the floor, a long lens, off the front-right of the drift

const SWEEP = [
  { pos: [3.4, 0.28, -4.4],  look: [0, 0.55, -1.4], fov: 34 },
  { pos: [3.0, 1.9, -0.6],   look: [0, 0.5, 0],     fov: 38 },
  { pos: [1.5, 2.1, 3.0],    look: [0, 0.62, 0.4],  fov: 40 },
  { pos: [0, 1.15, 4.8],     look: [0, 0.75, 0],    fov: 42 },
];
const REVEAL_AT = 0.74;            // the titles clear once the car has stopped and flashed

/* The entrance, as one curve: a wipe straight across the lens close
   enough to fill it, a wide U-turn away through the background, then the
   run back to the mark. */
const PATH = [
  [-12, GROUND, 3.2], [0, GROUND, 3.0], [10, GROUND, 2.2],
  [11, GROUND, -3.5], [3.5, GROUND, -4.5], MARK,
];

/* Phase boundaries, in curve parameter. Six control points make five
   segments, so the waypoints fall on fifths; the warp below lines those
   up with the timings each phase is described in. */
const U_WIPE = 0.4;                // ...through PATH[2]
const U_TURN = 0.8;                // ...through PATH[4]

/* Which part of the car stands for which part of the portfolio. Clicking a
   part scrolls to its section; the scroll is what moves the camera, so the
   camera glides there rather than cutting. */
export const PARTS = {
  stack: "background",
  about: "experience",
  projects: "projects",
  contact: "contact",
  services: "services",
};

/* The tour. Written in the car's own frame — origin at the car, ground at
   y = 0, nose toward +Z — and lifted onto the shed floor in the loop, so
   these numbers stay readable against the car rather than against the world.
   `at` is how far down the dossier each shot lands, 0 at the top, 1 at the
   foot.

   The three rows marked "transit" are mine, not shots: a straight line from
   the left flank to the right rear quarter, or from behind the pipes round
   to the front, runs through the body. They swing the camera round the
   outside instead. Nothing is meant to stop on them. */
const TOUR = [
  { at: 0,    pos: [0, 1.1, 4.5],     look: [0, 0.4, 0],       fov: 42, roll: 0 },     // hero, square on the front
  { at: 0.18, pos: [-2.2, 0.32, 1.8], look: [-0.6, 0.3, 1.2],  fov: 28, roll: 0.05 },  // low front quarter, wheel and caliper
  { at: 0.35, pos: [-2.0, 0.5, -0.2], look: [-0.2, 0.4, -0.1], fov: 32, roll: -0.04 }, // down the flank, carbon roof line
  { at: 0.44, pos: [-1.9, 0.75, -3.4], look: [0, 0.4, -1.6],   fov: 32, roll: 0 },     // transit: round the left rear
  { at: 0.52, pos: [1.0, 0.9, -4.1],  look: [0.1, 0.38, -1.8], fov: 31, roll: 0.02 },  // transit: across the tail
  { at: 0.6,  pos: [2.2, 0.9, -2.4],  look: [0.2, 0.35, -1.8], fov: 30, roll: 0.03 },  // rear three-quarter, tail lamps
  { at: 0.85, pos: [0, 0.35, -4.6],   look: [0, 0.3, -2.0],    fov: 34, roll: 0 },     // low, diffuser and pipes
  { at: 0.93, pos: [2.4, 0.8, -1.0],  look: [0, 0.45, -0.6],   fov: 35, roll: 0 },     // transit: up the right side
  { at: 1,    pos: [2.5, 1.4, 3.8],   look: [0, 0.5, 0],       fov: 36, roll: 0 },     // pulled back, final stance
];

/** Where the camera is at a point in the tour, in the car's own frame. */
function tourAt(p, out) {
  let i = 0;
  while (i < TOUR.length - 2 && p > (TOUR[i + 1].at ?? 1)) i += 1;
  const a = TOUR[i], b = TOUR[i + 1];
  const k = clamp01((p - (a.at ?? 0)) / Math.max(1e-4, (b.at ?? 1) - (a.at ?? 0)));
  const t = k * k * (3 - 2 * k);                    // smoothstep
  for (let j = 0; j < 3; j += 1) {
    out.pos[j] = a.pos[j] + (b.pos[j] - a.pos[j]) * t;
    out.look[j] = a.look[j] + (b.look[j] - a.look[j]) * t;
  }
  out.fov = a.fov + (b.fov - a.fov) * t;
  out.roll = a.roll + (b.roll - a.roll) * t;
}

/* The old scroll tour. Kept for the drive-in entrance, which still holds the
   opening shot while the door goes up. */
const SHOTS = [
  { at: 0.00, pos: [0, 0.9, 4.6],      look: [0, 0.4, -1.2],    roll: 0,     fov: 42 },  // wide, behind the type
  { at: 0.20, pos: [0.95, 0.15, 1.8],  look: [0.25, 0.15, 0.8], roll: -0.15, fov: 28 },  // grille and running lights
  { at: 0.40, pos: [-1.75, 0.05, 0.3], look: [-0.8, 0, 0.3],    roll: 0.16,  fov: 26 },  // front wheel, caliper
  { at: 0.60, pos: [-1.3, 1.1, -0.2],  look: [0.1, 0.4, -1.2],  roll: -0.09, fov: 34 },  // bonnet vents into the cockpit
  { at: 0.80, pos: [0.85, 0.1, -4.6],  look: [0, 0.2, -3.0],    roll: 0.12,  fov: 30 },  // diffuser and pipes
  { at: 1.00, pos: [0, 4.2, -1.2],     look: [0, -0.5, -1.2],   roll: 0,     fov: 45 },  // straight down on the roof
];

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (t) => 0.5 - Math.cos(Math.PI * clamp01(t)) / 2;

/* The shots are framed for a wide window. A phone is narrower than it is
   tall, so the same focal length crops the car to a wall of paint; the
   camera backs off along its own sightline instead, which keeps the focal
   length — and so the look of each shot — exactly as written. */
const FRAMED_AT = 1.7;
const dollyFor = (aspect) => (aspect >= FRAMED_AT ? 1 : Math.min(2.3, FRAMED_AT / aspect));

/* Time to distance along the curve. The wipe is linear — the car is at
   speed before it enters — the turn is eased, and the last stretch
   decelerates into the mark. */
function warp(t) {
  if (t < 0.35) return (t / 0.35) * U_WIPE;
  if (t < 0.75) return U_WIPE + ease((t - 0.35) / 0.4) * (U_TURN - U_WIPE);
  const k = clamp01((t - 0.75) / 0.25);
  return U_TURN + (1 - (1 - k) * (1 - k)) * (1 - U_TURN);
}

/** Shortest way round from one heading to another. */
function turnTo(from, to, k) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return from + d * k;
}

/** Where the camera is at a given point in the tour. */
function shotAt(p, out) {
  let i = 0;
  while (i < SHOTS.length - 2 && p > SHOTS[i + 1].at) i += 1;
  const a = SHOTS[i], b = SHOTS[i + 1];
  const k = clamp01((p - a.at) / Math.max(1e-4, b.at - a.at));
  const t = k * k * (3 - 2 * k);                       // smoothstep
  for (let j = 0; j < 3; j += 1) {
    out.pos[j] = a.pos[j] + (b.pos[j] - a.pos[j]) * t;
    out.look[j] = a.look[j] + (b.look[j] - a.look[j]) * t;
  }
  out.roll = a.roll + (b.roll - a.roll) * t;
  out.fov = a.fov + (b.fov - a.fov) * t;
}

/** Splits a combined wheel node into four, by where each mesh sits. */
function splitWheels(THREE, root, box, axis, side) {
  const groups = [];
  root.traverse((o) => { if (/wheel/i.test(o.name) && o.children.length) groups.push(o); });
  const host = groups.sort((a, b) => b.children.length - a.children.length)[0];
  if (!host) return [];

  const midA = (box.min[axis] + box.max[axis]) / 2;
  const midS = (box.min[side] + box.max[side]) / 2;
  const corners = new Map();
  const meshes = [];
  host.traverse((o) => { if (o.isMesh) meshes.push(o); });

  for (const m of meshes) {
    const c = new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3());
    const key = `${c[axis] > midA ? "R" : "F"}${c[side] > midS ? "L" : "R"}`;
    if (!corners.has(key)) corners.set(key, { meshes: [], sum: new THREE.Vector3(), n: 0 });
    const g = corners.get(key);
    g.meshes.push(m);
    g.sum.add(c);
    g.n += 1;
  }

  const pivots = [];
  host.updateMatrixWorld(true);
  for (const g of corners.values()) {
    const pivot = new THREE.Group();
    // the centre is in world space; the pivot lives inside `host`, which has
    // a transform of its own, so it has to be converted or the wheel spins
    // about a point somewhere off in the scene
    pivot.position.copy(host.worldToLocal(g.sum.divideScalar(g.n)));
    host.add(pivot);
    pivot.updateMatrixWorld(true);
    for (const m of g.meshes) pivot.attach(m);       // keeps each mesh where it looks
    pivots.push(pivot);
  }
  return pivots;
}

/* The ceiling of a detailing shop: a honeycomb of LED panels. The same
   layout is built twice — once as geometry overhead, once into the
   environment map — because what sells it is not the panels themselves but
   their reflection crawling across the bonnet and the roof. */
const HEX_R = 0.78;                 // panel radius
const HEX_GAP = 1.44;               // centre to centre
function hexGrid(THREE, make) {
  const rows = 5, cols = 5;
  const dx = HEX_GAP * Math.sqrt(3) / 2;
  for (let r = -Math.floor(rows / 2); r <= Math.floor(rows / 2); r += 1) {
    for (let c = -Math.floor(cols / 2); c <= Math.floor(cols / 2); c += 1) {
      const x = c * dx * 2 + (r % 2 ? dx : 0);
      const z = r * HEX_GAP * 1.5;
      make(x, z);
    }
  }
}

/* A dark studio, built as a scene of bright strips and baked into an
   environment map: one softbox over the car and a cool rim down each
   flank. Nothing else lights it — the shape of the car is told entirely
   by where those strips land on it. */
function studio(THREE, renderer) {
  const box = new THREE.Scene();
  // dark, but not a void: a white car in a black box reflects a black box
  box.background = new THREE.Color(0x242a35);

  const strip = (pos, scale, intensity, tint) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(tint).multiplyScalar(intensity),
        side: THREE.DoubleSide,
      }),
    );
    m.position.set(pos[0], pos[1], pos[2]);
    m.scale.set(scale[0], scale[1], 1);
    m.lookAt(0, 0, 0);
    box.add(m);
  };

  // the honeycomb overhead is what the paint reflects
  hexGrid(THREE, (x, z) => {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(HEX_R * 0.78, HEX_R, 6),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(0xeaf6ff).multiplyScalar(5), side: THREE.DoubleSide }),
    );
    m.position.set(x, 3.9, z - 1.5);
    m.rotation.x = -Math.PI / 2;
    box.add(m);
  });
  strip([-5, 1.6, -1], [8, 1], 3, 0x38bdf8);        // a cool rim per flank
  strip([5, 1.6, -1], [8, 1], 3, 0x38bdf8);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromScene(box, 0.04);
  pmrem.dispose();
  box.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) o.material.dispose();
  });
  return rt;
}

/* The shadow the car stands in. A true contact shadow wants its own depth
   pass every frame; this is a painted one — an elliptical pool the size of
   the footprint, darker under the axles. */
function shadowPool(THREE) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 512;
  const g = c.getContext("2d");
  const blob = (x, y, rx, ry, a) => {
    const grd = g.createRadialGradient(0, 0, 0, 0, 0, 1);
    grd.addColorStop(0, `rgba(6,8,14,${a})`);
    grd.addColorStop(0.55, `rgba(6,8,14,${a * 0.45})`);
    grd.addColorStop(1, "rgba(6,8,14,0)");
    g.save();
    g.translate(x, y);
    g.scale(rx, ry);
    g.fillStyle = grd;
    g.fillRect(-1, -1, 2, 2);
    g.restore();
  };
  blob(128, 256, 104, 232, 0.72);                    // the body
  for (const y of [150, 368]) {                      // and darker at the axles
    blob(56, y, 40, 40, 0.5);
    blob(200, y, 40, 40, 0.5);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 6.8),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(MARK[0], GROUND + 0.004, MARK[2]);
  return mesh;
}

/* A box of painted steel, which is most of what a workshop is made of. */
function steel(THREE, color, metalness, roughness) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness, envMapIntensity: 1.2 });
}

/* What stands on the shed floor: the honeycomb overhead and the gear a
   detailing bay actually has in it, kept back by the walls so the camera
   has the whole of the car to itself. The
   building itself is a model now, so nothing here draws a floor or a wall. */
function workshop(THREE) {
  const g = new THREE.Group();

  // the panels overhead, the ones the paint reflects
  const panels = [];
  hexGrid(THREE, (hx, hz) => {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(HEX_R * 0.78, HEX_R, 6),
      new THREE.MeshBasicMaterial({ color: 0xe0f2fe, side: THREE.DoubleSide, transparent: true }),
    );
    m.position.set(hx, GROUND + 3.9, hz - 1.5);
    m.rotation.x = -Math.PI / 2;
    g.add(m);
    panels.push(m.material);
  });

  // ── what else lives in a workshop ───────────────
  const chest = (x, z, turn) => {
    const unit = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.05, 1.9), steel(THREE, 0xb91c1c, 0.55, 0.42));
    body.position.y = 0.52;
    unit.add(body);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.06, 1.96), steel(THREE, 0x94a3b8, 0.9, 0.2));
    top.position.y = 1.08;
    unit.add(top);
    // drawer lines, so it is not a plain slab
    for (let i = 0; i < 4; i += 1) {
      const pull = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.035, 1.3), steel(THREE, 0xcbd5e1, 0.9, 0.25));
      pull.position.set(0.42, 0.22 + i * 0.22, 0);
      unit.add(pull);
    }
    unit.position.set(x, GROUND, z);
    unit.rotation.y = turn;
    g.add(unit);
  };
  chest(-8.7, -3.4, Math.PI / 2);
  chest(8.7, -4.6, -Math.PI / 2);

  // pegboard over the bench, with a rack of tools on it
  for (const sd of [-1, 1]) {
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.7, 2.4),
      steel(THREE, 0x16202f, 0.25, 0.8),
    );
    board.position.set(sd * 9.3, GROUND + 2.3, sd < 0 ? -3.4 : -4.6);
    g.add(board);
    for (let i = 0; i < 7; i += 1) {
      const tool = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.3 + Math.random() * 0.34, 0.07),
        steel(THREE, 0x8fa3bb, 0.85, 0.3),
      );
      tool.position.set(sd * 9.22, GROUND + 2.5, (sd < 0 ? -3.4 : -4.6) - 0.95 + i * 0.32);
      g.add(tool);
    }
  }

  // a couple of drums in the corner
  for (let i = 0; i < 2; i += 1) {
    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.34, 0.95, 16),
      steel(THREE, i ? 0x1f3a5f : 0x3f4652, 0.6, 0.45),
    );
    drum.position.set(-8.6 + i * 0.78, GROUND + 0.475, -9.2);
    g.add(drum);
  }

  return { group: g, panels };
}

export function CarScene({ reduced, onReveal, onDone, onPart, progressRef }) {
  const host = useRef(null);
  const [armed, setArmed] = useState(false);
  const api = useRef(null);
  const mark = (v) => { if (host.current) host.current.dataset.state = v; };

  // the car opens the site, so it loads straight away
  useEffect(() => {
    if (reduced) { onReveal && onReveal(); onDone && onDone(); return; }
    setArmed(true);
  }, [reduced, onReveal, onDone]);

  useEffect(() => {
    if (!armed) return undefined;
    mark("loading");
    let alive = true;
    let dispose = () => {};

    (async () => {
      const progress = progressRef || { current: 0 };
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      // the model ships meshopt-compressed: 20.4MB of geometry became 3MB
      const { MeshoptDecoder } = await import("three/examples/jsm/libs/meshopt_decoder.module.js");
      const { EffectComposer } = await import("three/examples/jsm/postprocessing/EffectComposer.js");
      const { RenderPass } = await import("three/examples/jsm/postprocessing/RenderPass.js");
      const { UnrealBloomPass } = await import("three/examples/jsm/postprocessing/UnrealBloomPass.js");
      const { OutputPass } = await import("three/examples/jsm/postprocessing/OutputPass.js");
      if (!alive) return;
      const el = host.current;
      if (!el) return;

      const vw = () => window.innerWidth;
      const vh = () => window.innerHeight;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(vw(), vh());
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      // Volumetric haze rather than a metal door. It starts thick enough to
      // swallow the shed and thins as the camera arrives, which reads as
      // coming in out of the dark without any geometry to go wrong.
      const haze = new THREE.FogExp2(0x070b14, 0.22);
      scene.fog = haze;
      const camera = new THREE.PerspectiveCamera(SHOTS[0].fov, vw() / vh(), 0.1, 120);
      renderer.setClearColor(0x05080f, 1);

      // Bloom from what is actually bright. The scene renders to a half-float
      // target, so the lamps (emissive far above 1) carry their real energy
      // into the bloom, and the threshold keeps lit paint out of it. Tone
      // mapping and exposure happen after, in the output pass, so the glow
      // dims and brightens with the room exactly as the lamps do.
      const composer = new EffectComposer(renderer);
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(vw(), vh());
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(vw() / 2, vh() / 2), 0.34, 0.16, 3.2);
      composer.addPass(bloom);
      composer.addPass(new OutputPass());
      const env = studio(THREE, renderer);
      scene.environment = env.texture;

      const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
      // fetched in parallel with the car; it joins the scene before the
      // intro starts, so four megabytes of textures do not upload mid-drift
      const shedLoad = loader.loadAsync(SHED);
      let gltf;
      try {
        gltf = await loader.loadAsync(MODEL);
      } catch {
        if (alive) mark("failed");
        return;
      }
      if (!alive) return;

      const car = gltf.scene;
      car.updateMatrixWorld(true);
      let box = new THREE.Box3().setFromObject(car);
      let size = box.getSize(new THREE.Vector3());

      // ── normalise ─────────────────────────────────────
      // length along Z, nose at +Z, exactly CAR_LENGTH long, centred on the
      // origin and standing on y=0
      const alongX = size.x > size.z;
      const lateral = alongX ? "z" : "x";          // the axis the wheels spin about
      if (alongX) car.rotation.y = Math.PI / 2;
      car.updateMatrixWorld(true);
      box = new THREE.Box3().setFromObject(car);
      size = box.getSize(new THREE.Vector3());
      car.scale.setScalar(CAR_LENGTH / size.z);

      // which end is the nose: the front overhang on a saloon is the shorter
      // one, so the end nearer its own axle leads
      const hubs = [];
      car.traverse((o) => { if (/wheel/i.test(o.name)) hubs.push(o); });
      car.updateMatrixWorld(true);
      box = new THREE.Box3().setFromObject(car);
      let flip = false;
      if (hubs.length) {
        let near = Infinity, far = -Infinity;
        const v = new THREE.Vector3();
        for (const h of hubs) {
          h.getWorldPosition(v);
          near = Math.min(near, v.z);
          far = Math.max(far, v.z);
        }
        flip = (box.max.z - far) > (near - box.min.z);
      }
      if (flip) car.rotation.y += Math.PI;

      car.updateMatrixWorld(true);
      box = new THREE.Box3().setFromObject(car);
      const centre = box.getCenter(new THREE.Vector3());
      car.position.x -= centre.x;
      car.position.z -= centre.z;
      car.position.y -= box.min.y;
      car.updateMatrixWorld(true);

      // the rolling radius, for wheels that turn with the distance covered
      let wheelR = 0.33;
      if (hubs.length) {
        const ws = new THREE.Box3().setFromObject(hubs[0]).getSize(new THREE.Vector3());
        wheelR = Math.max(ws.y, 0.1) / 2;
      }

      // the rigged parts: Body, four Door_*, four Wheel_*, each already
      // given its hinge or hub as an origin before export
      const wheels = [];
      car.traverse((o) => { if (/^Wheel_[FR][LR]/.test(o.name)) wheels.push(o); });
      if (!wheels.length) {
        wheels.push(...splitWheels(THREE, car, box, alongX ? "x" : "z", lateral));
      }

      const doors = [];
      car.traverse((o) => {
        const m = /^Door_([FR])([LR])/.exec(o.name);
        if (m) doors.push({ node: o, rear: m[1] === "R", left: m[2] === "L" });
      });

      let hood = null;
      car.traverse((o) => { if (o.name === "Hood") hood = o; });

      // ── surfaces ──────────────────────────────────────
      // the strips in the environment are the only light, so every surface
      // leans on its reflection; the paint is white, tight and glossy
      const lampMats = [];
      const lensMats = [];
      car.traverse((o) => {
        if (!o.isMesh || !o.material) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          if (!m.isMeshStandardMaterial) continue;
          m.envMapIntensity = 1.2;
          if (/paint/i.test(m.name || "")) {
            m.color = new THREE.Color(0xf4f6f9);
            // paint is a dielectric under a clear coat; metal here is what
            // turned the white car charcoal
            m.metalness = 0.05;
            m.roughness = Math.min(m.roughness ?? 1, 0.2);
            m.envMapIntensity = 1.6;
            if ("clearcoat" in m) { m.clearcoat = 1; m.clearcoatRoughness = 0.05; }
          }
          if (/chrom|metal|rim|caliper/i.test(m.name || "")) {
            m.roughness = Math.min(m.roughness ?? 1, 0.2);
            m.envMapIntensity = 1.6;
          }
          // the lamps are one material shared by both ends, lit through their
          // own texture: a flat emissive colour floods the whole unit and
          // turns it into a grey slab, an emissive map only lights the parts
          // of the lens that are meant to be lit
          // the recessed housing the blades sit in
          if (/base|interior/i.test(m.name || "") && /light/i.test(o.name || "")) {
            m.color = new THREE.Color(0x0f1115);
            m.roughness = 0.15;
            m.metalness = 0.8;
            m.envMapIntensity = 1.4;
          }
          if (/light/i.test(m.name || "")) {
            m.emissiveMap = m.map || null;
            m.emissive = new THREE.Color(m.map ? 0xffffff : 0xfff1d6);
            m.emissiveIntensity = 0;
            m.roughness = Math.min(m.roughness ?? 1, 0.18);
            m.envMapIntensity = 1.6;
            lampMats.push(m);
          }
          // The tail lens. Flooding this with emissive is what turned the
          // lamps into orange blobs: the whole lens lit evenly and the bar
          // graphic underneath was lost. It is glass — dark, deep and
          // glossy — and the light comes from the unit behind it.
          if (/red_glass/i.test(m.name || "")) {
            // The lamp texture is a greyscale atlas of reflector detail —
            // there is no red blade graphic in the asset at all. The blades
            // are GEOMETRY inside the lamp, and this lens was sitting on top
            // of them as an opaque slab, which is the red candy block.
            //
            // So the lens stops being a surface and becomes what it really
            // is: a coloured filter. Multiplying means the lit internals
            // come through red where they are bright and stay black where
            // they are not, which is how a tail lamp actually works.
            m.color = new THREE.Color(0xff2a10);
            m.emissive = new THREE.Color(0x000000);
            m.emissiveIntensity = 0;
            m.transparent = true;
            m.opacity = 1;
            m.blending = THREE.MultiplyBlending;
            m.depthWrite = false;
            m.side = THREE.FrontSide;
            m.roughness = 0.05;
            m.metalness = 0;
            if ("transmission" in m) m.transmission = 0;
            m.needsUpdate = true;
            lensMats.push(m);
          }
          // the glazing reflects the strips rather than going flat
          if (/window/i.test(m.name || "")) {
            m.roughness = 0;
            m.envMapIntensity = 1.4;
          }
        }
      });

      // ── lighter materials ──
      // The glass used real transmission, which renders the whole scene a
      // second time every frame for the windows to refract. Smoked glass
      // that reflects the room reads the same at this distance. And most of
      // the model's physical materials use nothing a standard material does
      // not have: they cost the heaviest shader for no difference, so they
      // drop to standard. Paint and carbon keep their clearcoat; the lamps
      // and the red lens keep theirs because the lamp code holds them.
      {
        const keep = new Set([...lampMats, ...lensMats]);
        const swap = new Map();
        car.traverse((o) => {
          if (!o.isMesh) return;
          const list = Array.isArray(o.material) ? o.material : [o.material];
          const next = list.map((m) => {
            if (!m || !m.isMeshPhysicalMaterial || keep.has(m)) return m;
            if (swap.has(m)) return swap.get(m);
            let out = m;
            if (m.transmission > 0) {
              m.transmission = 0;
              m.transparent = true;
              m.opacity = 0.42;
              m.color.setRGB(0.05, 0.06, 0.07);
              m.roughness = 0.04;
              m.metalness = 0;
              m.depthWrite = false;
              m.envMapIntensity = 1.4;
            } else if (!(m.clearcoat > 0) && !(m.sheen > 0) && !(m.iridescence > 0)) {
              out = new THREE.MeshStandardMaterial();
              out.copy(m);
              out.name = m.name;
              m.dispose();
            }
            swap.set(m, out);
            return out;
          });
          o.material = Array.isArray(o.material) ? next : next[0];
        });
      }

      const rig = new THREE.Group();
      rig.rotation.order = "YXZ";
      // The body rolls and dives on its springs about a pivot near the roll
      // centre; the wheels do not. Tilting the whole car about the floor
      // swung the outside wheels into the ground mid-drift.
      const ROLL_CENTRE = 0.42;
      const chassis = new THREE.Group();
      chassis.rotation.order = "YXZ";
      chassis.position.y = ROLL_CENTRE;
      car.position.y -= ROLL_CENTRE;
      chassis.add(car);
      rig.add(chassis);
      scene.add(rig);
      rig.updateMatrixWorld(true);
      // each wheel moves to a holder that copies where its parent was, so it
      // keeps its own local axes (spin and steer still work as before) but
      // follows only the rig: position and heading, never the body's tilt
      for (const w of wheels) {
        const holder = new THREE.Group();
        w.parent.matrixWorld.decompose(holder.position, holder.quaternion, holder.scale);
        rig.add(holder);
        holder.add(w);
      }
      rig.updateMatrixWorld(true);

      // headlight throw: two spots at the nose, pooling on the floor ahead
      // in the dark. They go out with the DRLs once the car is parked.
      // One light for both lamps: every lit shader in the scene loops over
      // every light, and on Windows each one is paid for again in compile time.
      const beams = [];
      {
        const b = new THREE.SpotLight(0xdbeafe, 0, 0, 0.62, 0.7, 2);
        b.position.set(0, 0.68, CAR_LENGTH / 2 - 0.15);
        b.target.position.set(0, 0, CAR_LENGTH / 2 + 7);
        rig.add(b, b.target);
        beams.push(b);
      }

      // the front pair steers. Spin is about the axle and steer about the
      // vertical, so the steer has to be applied last.
      const fronts = [];
      let wheelbase = 2.9;
      {
        const v = new THREE.Vector3();
        let fz = 0, rz = 0, nf = 0, nr = 0;
        for (const w of wheels) {
          w.getWorldPosition(v);
          if (v.z > 0) { fronts.push(w); fz += v.z; nf += 1; } else { rz += v.z; nr += 1; }
        }
        if (nf && nr) wheelbase = Math.max(1.5, fz / nf - rz / nr);
        for (const w of fronts) w.rotation.order = lateral === "x" ? "YXZ" : "YZX";
      }
      const rears = new Set(wheels.filter((w) => !fronts.includes(w)));

      // ── tyre smoke ──────────────────────────────────
      // Points, one draw call: each puff is born at a rear contact patch,
      // thrown back off the tyre, swells, lifts and thins out.
      const SMOKE_N = 380;
      const sPos = new Float32Array(SMOKE_N * 3);
      const sSize = new Float32Array(SMOKE_N);
      const sAlpha = new Float32Array(SMOKE_N);
      const sVel = new Float32Array(SMOKE_N * 3);
      const sAge = new Float32Array(SMOKE_N).fill(1e9);
      const sLife = new Float32Array(SMOKE_N).fill(1);
      const sBase = new Float32Array(SMOKE_N);
      let sNext = 0, sLive = 0;
      const smokeGeo = new THREE.BufferGeometry();
      smokeGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
      smokeGeo.setAttribute("aSize", new THREE.BufferAttribute(sSize, 1));
      smokeGeo.setAttribute("aAlpha", new THREE.BufferAttribute(sAlpha, 1));
      const puffTex = (() => {
        const c = document.createElement("canvas");
        c.width = c.height = 128;
        const g = c.getContext("2d");
        // a few offset blobs, so a puff is lumpy rather than a perfect disc
        for (let i = 0; i < 6; i += 1) {
          const x = 64 + (Math.random() - 0.5) * 34, y = 64 + (Math.random() - 0.5) * 34;
          const r = 34 + Math.random() * 22;
          const grd = g.createRadialGradient(x, y, 0, x, y, r);
          grd.addColorStop(0, "rgba(255,255,255,0.42)");
          grd.addColorStop(0.6, "rgba(255,255,255,0.12)");
          grd.addColorStop(1, "rgba(255,255,255,0)");
          g.fillStyle = grd;
          g.fillRect(0, 0, 128, 128);
        }
        return new THREE.CanvasTexture(c);
      })();
      const smokeMat = new THREE.ShaderMaterial({
        uniforms: { uTex: { value: puffTex }, uScale: { value: 400 }, uLight: { value: 1 } },
        vertexShader: `
attribute float aSize;
attribute float aAlpha;
uniform float uScale;
varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  // smoke thins out as it nears the lens instead of washing over the frame
  vAlpha = aAlpha * smoothstep(1.2, 4.0, -mv.z);
  // capped: a few hundred near-full-screen quads is what made it stutter
  gl_PointSize = min(aSize * uScale / max(0.2, -mv.z), 300.0);
  gl_Position = projectionMatrix * mv;
}`,
        fragmentShader: `
uniform sampler2D uTex;
uniform float uLight;
varying float vAlpha;
void main() {
  vec4 t = texture2D(uTex, gl_PointCoord);
  gl_FragColor = vec4(vec3(0.58, 0.61, 0.66) * uLight, t.a * vAlpha);
}`,
        transparent: true, depthWrite: false,
      });
      const smoke = new THREE.Points(smokeGeo, smokeMat);
      smoke.frustumCulled = false;
      smoke.renderOrder = 6;
      scene.add(smoke);
      const puffAt = new THREE.Vector3();
      const emitSmoke = (from, backX, backZ) => {
        const i = sNext;
        sNext = (sNext + 1) % SMOKE_N;
        sPos[i * 3] = from.x + (Math.random() - 0.5) * 0.25;
        sPos[i * 3 + 1] = GROUND + 0.12 + Math.random() * 0.1;
        sPos[i * 3 + 2] = from.z + (Math.random() - 0.5) * 0.25;
        const kick = 1.0 + Math.random() * 1.2;
        sVel[i * 3] = backX * kick + (Math.random() - 0.5) * 0.9;
        sVel[i * 3 + 1] = 0.25 + Math.random() * 0.35;
        sVel[i * 3 + 2] = backZ * kick + (Math.random() - 0.5) * 0.9;
        sAge[i] = 0;
        sLife[i] = 1.3 + Math.random() * 1.0;
        sBase[i] = 0.22 + Math.random() * 0.2;
      };
      const stepSmoke = (dt) => {
        let live = 0;
        const drag = Math.exp(-1.6 * dt);
        for (let i = 0; i < SMOKE_N; i += 1) {
          if (sAge[i] > sLife[i]) { sAlpha[i] = 0; continue; }
          live += 1;
          sAge[i] += dt;
          sVel[i * 3] *= drag;
          sVel[i * 3 + 2] *= drag;
          sVel[i * 3 + 1] = sVel[i * 3 + 1] * drag + 0.12 * dt;
          sPos[i * 3] += sVel[i * 3] * dt;
          sPos[i * 3 + 1] += sVel[i * 3 + 1] * dt;
          sPos[i * 3 + 2] += sVel[i * 3 + 2] * dt;
          const a = sAge[i] / sLife[i];
          sSize[i] = sBase[i] * (1 + sAge[i] * 1.45);
          sAlpha[i] = 0.24 * Math.min(1, sAge[i] / 0.1) * Math.pow(Math.max(0, 1 - a), 1.5);
        }
        if (live || sLive) {
          smokeGeo.attributes.position.needsUpdate = true;
          smokeGeo.attributes.aSize.needsUpdate = true;
          smokeGeo.attributes.aAlpha.needsUpdate = true;
        }
        sLive = live;
        smoke.visible = live > 0;
      };

      // No hinge group. The panel Blender pulled out as "Hood" is a carbon
      // component that sits over the painted bonnet, not the bonnet itself,
      // so nothing swings it — and re-parenting it to rebuild a pivot only
      // rebuilt its transform and left it floating proud of the bodywork.
      // It stays exactly where the model author put it.

      // ── the headlamp signature ────────────────────
      // Head and tail lamps share one material, and its emissive is white,
      // so the DRLs came out pale grey. The CS wears amber "L" daytime
      // lights under a cyan eyeliner along the top edge. There is no
      // separate mesh for either, so the colour is laid in by position:
      // the front of the car, banded by height across the lamp unit. The
      // tail lamps keep their white, which the red filter in front of them
      // turns red.
      const lampU = {
        uRigInv: { value: new THREE.Matrix4() },   // world into the car's own frame
        uHead: { value: 1 },                        // the DRLs, on or off
        uBoost: { value: 1 },                       // makes up for the dim intro exposure
        uBlink: { value: 0 },                       // the hazards, 0 dark to 1 lit
        uHaz: { value: 0 },                         // hazards running
        uMidX: { value: 0.6 },                      // inner L | outer L, across the lamp
        uYellow: { value: 0 },                      // CS: the L tubes run yellow with the beams on
        uYLo: { value: 0 },
        uYHi: { value: 1 },
      };
      {
        // rig is still at the origin here, so world space is the car's own
        let lo = Infinity, hi = -Infinity;
        const v = new THREE.Vector3();
        car.traverse((o) => {
          if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          if (!mats.some((m) => lampMats.includes(m))) return;
          o.updateMatrixWorld(true);
          const pos = o.geometry.attributes.position;
          for (let i = 0; i < pos.count; i += 2) {
            v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
            if (v.z > 0.8) { lo = Math.min(lo, v.y); hi = Math.max(hi, v.y); }
          }
        });
        if (hi > lo) { lampU.uYLo.value = lo; lampU.uYHi.value = hi; }
      }

      // ── headlamp glare ──────────────────────────────
      // A hot core and a thin anamorphic streak on each lamp, drawn additive
      // and outside tone mapping so they hold their brightness in the dark
      // intro. Placed on the centre of each lamp's lit area, just proud of
      // the lens so the glass does not swallow them.
      const glares = [];
      const hazards = [];
      {
        const sum = { l: new THREE.Vector3(), r: new THREE.Vector3() };
        const n = { l: 0, r: 0 };
        const front = { l: -Infinity, r: -Infinity };
        const reach = { l: 0, r: 0 };             // how far outboard each lamp runs
        // the indicators: the upper band at the front, the outboard end of
        // each tail lamp at the back
        const band = { l: new THREE.Vector3(), r: new THREE.Vector3() };
        const nb = { l: 0, r: 0 };
        const tails = [];
        let tailX = 0;
        const v = new THREE.Vector3();
        const lo = lampU.uYLo.value, hi = lampU.uYHi.value;
        car.traverse((o) => {
          if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          if (!mats.some((m) => lampMats.includes(m))) return;
          const pos = o.geometry.attributes.position;
          for (let i = 0; i < pos.count; i += 2) {
            v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
            if (v.z < -0.8) { tails.push(v.clone()); tailX = Math.max(tailX, Math.abs(v.x)); continue; }
            if (v.z <= 0.8) continue;
            const h = (v.y - lo) / Math.max(1e-4, hi - lo);
            if (h > 0.66 && h < 0.97) {
              const sd = v.x < 0 ? "l" : "r";
              band[sd].add(v);
              nb[sd] += 1;
            }
            if (h < 0.2 || h > 0.8) continue;        // the body of the lamp, not its rim
            const side = v.x < 0 ? "l" : "r";
            sum[side].add(v);
            n[side] += 1;
            front[side] = Math.max(front[side], v.z);
            reach[side] = Math.max(reach[side], Math.abs(v.x));
          }
        });
        const paint = (w, h, stops) => {
          const c = document.createElement("canvas");
          c.width = w;
          c.height = h;
          const g = c.getContext("2d");
          const grd = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
          for (const [at, col] of stops) grd.addColorStop(at, col);
          g.fillStyle = grd;
          g.fillRect(0, 0, w, h);
          const tex = new THREE.CanvasTexture(c);
          tex.colorSpace = THREE.SRGBColorSpace;
          return tex;
        };
        const coreTex = paint(128, 128, [
          [0, "rgba(255,255,255,1)"],
          [0.11, "rgba(240,250,255,0.9)"],
          [0.26, "rgba(160,215,255,0.36)"],
          [0.5, "rgba(70,155,255,0.08)"],
          [1, "rgba(0,60,160,0)"],
        ]);
        // the streak is a radial gradient squashed flat by the sprite's scale
        const streakTex = paint(128, 128, [
          [0, "rgba(235,248,255,0.9)"],
          [0.18, "rgba(150,215,255,0.3)"],
          [0.5, "rgba(60,150,255,0.06)"],
          [1, "rgba(0,80,200,0)"],
        ]);
        // the outer glass sits in front of the lamp unit and writes depth, so
        // a glare placed on the unit is hidden behind it. The car's outer
        // surface, front and back, is read off a coarse depth map built in
        // one pass over its vertices: rays against the whole unindexed car
        // cost ~150ms each and froze the page for a second at load.
        const CELL = 0.04, GX = 60, GY = 42;
        const nose = new Float32Array(GX * GY).fill(-Infinity);
        const tail = new Float32Array(GX * GY).fill(Infinity);
        {
          const w = new THREE.Vector3();
          car.traverse((o) => {
            if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
            const pos = o.geometry.attributes.position;
            for (let i = 0; i < pos.count; i += 2) {
              w.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
              const cx = Math.floor(w.x / CELL + GX / 2), cy = Math.floor(w.y / CELL);
              if (cx < 0 || cx >= GX || cy < 0 || cy >= GY) continue;
              const c = cy * GX + cx;
              if (w.z > nose[c]) nose[c] = w.z;
              if (w.z < tail[c]) tail[c] = w.z;
            }
          });
        }
        const surface = (at, dir) => {
          const cx = Math.floor(at.x / CELL + GX / 2), cy = Math.floor(at.y / CELL);
          let z = dir > 0 ? -Infinity : Infinity;
          for (let dy = -1; dy <= 1; dy += 1) {
            for (let dx = -1; dx <= 1; dx += 1) {
              const x = cx + dx, y = cy + dy;
              if (x < 0 || x >= GX || y < 0 || y >= GY) continue;
              z = dir > 0 ? Math.max(z, nose[y * GX + x]) : Math.min(z, tail[y * GX + x]);
            }
          }
          if (Number.isFinite(z)) at.z = z + dir * 0.02;
          return at;
        };
        const glow = (tex) => new THREE.SpriteMaterial({
          map: tex, color: 0xffffff, transparent: true, opacity: 0,
          blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
        });
        for (const side of ["l", "r"]) {
          if (!n[side]) continue;
          const at = sum[side].divideScalar(n[side]);
          at.z = front[side] + 0.015;
          surface(at, 1);                          // on the outer glass, not behind it
          // the rig is still at the origin, so this is the car's own frame
          const core = new THREE.Sprite(glow(coreTex));
          core.position.copy(at);
          core.scale.set(0.62, 0.62, 1);
          const streak = new THREE.Sprite(glow(streakTex));
          streak.position.copy(at);
          streak.scale.set(3.4, 0.07, 1);
          core.renderOrder = streak.renderOrder = 10;
          rig.add(core, streak);
          glares.push({ core, streak, at });
        }

        // amber for the hazards: a short warm glow on each indicator, no
        // streak, since an indicator is a small source, not a beam
        const amberTex = paint(128, 128, [
          [0, "rgba(255,236,200,1)"],
          [0.08, "rgba(255,170,60,0.8)"],
          [0.22, "rgba(255,120,10,0.25)"],
          [0.5, "rgba(255,90,0,0.04)"],
          [1, "rgba(255,80,0,0)"],
        ]);
        const amber = (at, dir) => {
          const sp = new THREE.Sprite(glow(amberTex));
          sp.position.copy(at);
          sp.renderOrder = 10;
          rig.add(sp);
          hazards.push({ sp, at, dir: dir.clone().normalize() });
        };
        // front: the outer L. The lamp's centre splits the two L elements.
        if (glares.length) {
          lampU.uMidX.value = glares.reduce((a, g) => a + Math.abs(g.at.x), 0) / glares.length;
        }
        // (the outer L itself goes amber in the lamp shader, and the bloom
        // makes it glow; it needs no sprite)
        // side repeaters live in the mirror housings: the mirror tip is the
        // widest point of the car at mirror height, ahead of the B-pillar
        {
          const tip = { [-1]: null, [1]: null };
          const w = new THREE.Vector3();
          car.traverse((o) => {
            if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
            const pos = o.geometry.attributes.position;
            for (let i = 0; i < pos.count; i += 3) {
              w.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
              if (w.y < 0.78 || w.y > 1.25 || w.z < 0 || w.z > 1.7) continue;
              const sd = w.x < 0 ? -1 : 1;
              if (!tip[sd] || Math.abs(w.x) > Math.abs(tip[sd].x)) tip[sd] = w.clone();
            }
          });
          for (const sd of [-1, 1]) {
            if (!tip[sd]) continue;
            // on the cap, just under and ahead of its widest point, as a
            // thin strip rather than a dot hanging off the side
            const at = tip[sd].clone();
            at.x -= sd * 0.005;
            at.y -= 0.04;
            at.z += 0.04;
            amber(at, new THREE.Vector3(sd, 0, 0.35));
            hazards[hazards.length - 1].strip = 0.085;
          }
        }
        // rear (ECE, which India follows): a thin amber strip through the
        // outer lamp, between its light elements, rather than a blob
        const stripTex = paint(128, 128, [
          [0, "rgba(255,220,170,1)"],
          [0.3, "rgba(255,150,40,0.75)"],
          [0.75, "rgba(255,100,0,0.12)"],
          [1, "rgba(255,80,0,0)"],
        ]);
        for (const sd of [-1, 1]) {
          const out = tails.filter((v) => Math.sign(v.x) === sd && Math.abs(v.x) > tailX * 0.55);
          if (!out.length) continue;
          let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity;
          for (const v of out) {
            x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x);
            y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y);
            z0 = Math.min(z0, v.z);
          }
          const at = surface(new THREE.Vector3((x0 + x1) / 2, (y0 + y1) / 2, z0 - 0.015), -1);
          const strip = new THREE.Sprite(glow(stripTex));
          strip.position.copy(at);
          strip.renderOrder = 10;
          rig.add(strip);
          hazards.push({ sp: strip, at, dir: new THREE.Vector3(0, 0, -1), strip: Math.max(0.2, (x1 - x0) * 0.9) });
          amber(at.clone(), new THREE.Vector3(0, 0, -1));
        }
      }
      for (const m of lampMats) {
        m.onBeforeCompile = (sh) => {
          Object.assign(sh.uniforms, lampU);
          sh.vertexShader = sh.vertexShader
            .replace("#include <common>", `#include <common>
varying vec3 vLampPos;`)
            .replace("#include <project_vertex>", `#include <project_vertex>
vLampPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`);
          sh.fragmentShader = sh.fragmentShader
            .replace("#include <common>", `#include <common>
varying vec3 vLampPos;
uniform mat4 uRigInv;
uniform float uHead;
uniform float uBoost;
uniform float uBlink;
uniform float uHaz;
uniform float uMidX;
uniform float uYellow;
uniform float uYLo;
uniform float uYHi;`)
            .replace("#include <map_fragment>", `#include <map_fragment>
{
  // smoked headlamp housing: the chrome reflector reads dark and tinted,
  // the light itself is added afterwards and stays bright
  vec3 lp0 = (uRigInv * vec4(vLampPos, 1.0)).xyz;
  if (lp0.z > 0.8) {
    // lit, the tint is deep so the light owns the lamp; switched off, the
    // reflectors read through the smoke the way a real unlit lamp does,
    // and the light guide shows as a pale frosted line instead of a hole
    float h0 = clamp((lp0.y - uYLo) / max(1e-4, uYHi - uYLo), 0.0, 1.0);
    float guide = smoothstep(0.64, 0.8, h0) * (1.0 - smoothstep(0.97, 1.0, h0));
    float off = 1.0 - uHead;
    diffuseColor.rgb *= mix(vec3(0.085, 0.09, 0.1), vec3(0.58, 0.61, 0.66), off);
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.72, 0.76, 0.8), guide * off * 0.85);
  }
}`)
            .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
{
  vec3 lp = (uRigInv * vec4(vLampPos, 1.0)).xyz;
  if (lp.z > 0.8) {
    float h = clamp((lp.y - uYLo) / max(1e-4, uYHi - uYLo), 0.0, 1.0);
    // white as daytime lights; on the CS they run yellow while the low or
    // high beam is on (BMW press release for the M5 CS)
    vec3 drl = mix(vec3(0.78, 0.9, 1.0) * 0.34, vec3(1.0, 0.72, 0.2) * 0.42, uYellow);
    vec3 liner = vec3(0.12, 0.74, 1.0) * 0.75; // the eyeliner: a thin laser-blue line
    // a band near the top edge with a soft start and a clean finish
    float band = smoothstep(0.86, 0.9, h) * (1.0 - smoothstep(0.95, 0.98, h));
    // "The outer daytime driving lights also perform the role of turn
    // indicators" (BMW, 5 Series LCI): the outer L flashes amber, the inner
    // L stays lit (ECE coding), so the lamp is never dark. The accent along
    // the top is not an indicator and stays as it is.
    vec3 base = totalEmissiveRadiance;
    vec3 amber = vec3(1.0, 0.34, 0.0) * 0.75;   // saturated; the bloom pass carries the glow
    float outer = smoothstep(uMidX - 0.02, uMidX + 0.02, abs(lp.x));
    vec3 lights = mix(drl * uHead, amber, uBlink * uHaz * outer);
    totalEmissiveRadiance = base * mix(lights, liner * uHead, band) * uBoost;
  }
}`);
        };
        m.needsUpdate = true;
      }

      const pool = shadowPool(THREE);
      scene.add(pool);


      const shop = workshop(THREE);
      scene.add(shop.group);


      // The building is a model. It is fitted by its height rather than its
      // footprint — the thing that has to feel right is the ceiling over the
      // car, and the length then falls where it falls.
      // ...and it arrives on its own time. Awaiting four megabytes here
      // would hold the car, the entrance and the whole page behind it.
      // the shed's own strip lights, so they catch with the honeycomb
      const strips = [];
      const shedReady = shedLoad.then((res) => {
        if (!alive) return;
        const shed = res.scene;
        shed.updateMatrixWorld(true);
        const sb = new THREE.Box3().setFromObject(shed);
        const ss = sb.getSize(new THREE.Vector3());
        if (ss.y > 0.01) {
          const fit = 4.9 / ss.y;
          shed.scale.setScalar(fit);
          shed.updateMatrixWorld(true);
          const b2 = new THREE.Box3().setFromObject(shed);
          const c2 = b2.getCenter(new THREE.Vector3());
          shed.position.x += MARK[0] - c2.x;
          shed.position.z += MARK[2] - c2.z;
          shed.position.y += GROUND - b2.min.y;
          shed.traverse((o) => {
            if (!o.isMesh) return;
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            for (const m of mats) {
              if (!m) continue;
              // its strip lights are the room's own light; everything else
              // reads off the same environment the car does
              if (m.emissive && m.emissiveIntensity > 0) {
                m.emissiveIntensity = Math.min(m.emissiveIntensity, 2.4);
                strips.push({ m, full: m.emissiveIntensity });
              }
              if (m.isMeshStandardMaterial) m.envMapIntensity = 0.7;
            }
          });
          scene.add(shed);
        }
      }).catch(() => {});   // no shed is survivable; the car is the point

      // ── warm up before the first frame of the intro ──
      // On Windows every shader goes through Direct3D, and a car-paint
      // shader can take a second or two to build; there are about thirty.
      // They are built in parallel, off the main thread, and for the bloom
      // target the scene really renders into (a screen compile builds
      // different variants, and the real builds then land mid-drift and the
      // car stops dead). Things that only appear later are made visible for
      // it. The intro clock waits until frames come in fast, and gives up
      // after ten seconds rather than hang.
      let warmed = false;
      let warmList = null, warmFast = 0, warmFrom = 0, compiled = false;
      shedReady.then(async () => {
        if (!alive) return;
        warmList = [];
        scene.traverse((o) => { if (!o.visible || o.isSprite || o.isPoints) warmList.push(o); });
        for (const o of warmList) o.visible = true;
        try {
          renderer.setRenderTarget(composer.readBuffer);
          if (renderer.compileAsync) await renderer.compileAsync(scene, camera);
        } catch { /* a failed warm-up only costs a stall later */ }
        renderer.setRenderTarget(null);
        compiled = true;
      });
      const warmStep = (t, gap) => {
        if (warmed || !warmList) return;
        if (!warmFrom) warmFrom = t;
        warmFast = compiled && gap < 34 ? warmFast + 1 : 0;
        if (warmFast >= 8 || t - warmFrom > 10000) {
          warmed = true;
          return;
        }
        for (const o of warmList) o.visible = true;
      };

      // ── the entrance ──────────────────────────────────
      const curve = new THREE.CatmullRomCurve3(PATH.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
      const heroHead = Math.atan2(HERO_LOOK[0] - MARK[0], HERO_LOOK[2] - MARK[2]);

      let introT = 0;
      let seek = null;                 // ?perf: hold the entrance at a point
      let introStart = 0;              // wall clock: a stalled frame cannot stretch it
      let revealed = false;
      let parked = false;

      const here = new THREE.Vector3();
      const prev = new THREE.Vector3();
      const tan = new THREE.Vector3();
      const prevTan = new THREE.Vector3();
      const cross = new THREE.Vector3();
      let havePrev = false;

      // ── the tour ──────────────────────────────────────
      const want = { pos: [0, 0, 0], look: [0, 0, 0], roll: 0, fov: SHOTS[0].fov };
      const camPos = new THREE.Vector3(SHOTS[0].pos[0], SHOTS[0].pos[1], SHOTS[0].pos[2]);
      const camLook = new THREE.Vector3(SHOTS[0].look[0], SHOTS[0].look[1], SHOTS[0].look[2]);
      const up = new THREE.Vector3(0, 1, 0);
      const view = new THREE.Vector3();
      let fov = SHOTS[0].fov;
      let roll = 0;
      let spin = 0, lamps = 0, doorOpen = 0, doorWant = 0;
      let hoodOpen = 0, hoodWant = 0;
      const glareAt = new THREE.Vector3(), glareFwd = new THREE.Vector3(), glareTo = new THREE.Vector3();
      // the drive-in: the path, how far along it the car is, the nose's dip
      // on its springs, the steering, and the DRLs
      const arrival = new THREE.SplineCurve(ARRIVAL.map(([x, z]) => new THREE.Vector2(x, z)));
      arrival.arcLengthDivisions = 400;
      const runLen = arrival.getLength();
      // cruise, then constant deceleration: v = (L + Lb) / T makes both fit
      const driveSecs = ((DRIVE_END - DRIVE_START) * INTRO_MS) / 1000;
      const brakeLen = Math.min(BRAKE_LEN, runLen * 0.4);
      const driftV = (runLen + brakeLen) / driveSecs;
      const cruiseSecs = (runLen - brakeLen) / driftV;
      const distAt = (sec) => {
        if (sec <= 0) return 0;
        if (sec <= cruiseSecs) return driftV * sec;
        const tb = Math.min(sec - cruiseSecs, (2 * brakeLen) / driftV);
        const decel = (driftV * driftV) / (2 * brakeLen);
        return runLen - brakeLen + driftV * tb - 0.5 * decel * tb * tb;
      };
      const speedAt = (sec) => {
        if (sec <= 0 || sec <= cruiseSecs) return sec < 0 ? 0 : driftV;
        const decel = (driftV * driftV) / (2 * brakeLen);
        return Math.max(0, driftV - decel * (sec - cruiseSecs));
      };
      const onPath = new THREE.Vector2(), tan2 = new THREE.Vector2();
      let travelled = 0, dip = 0, dipV = 0, steer = 0, lean = 0, head = 1, beam = 1, flash = 0;
      let parkedAt = 0, blink = 0, haz = 0;
      let slip = 0, rearSpin = 0, smokeDue = 0;
      const lens = { x: 0, y: 0, z: 0, ready: false };   // the camera's lagging look point
      const toWorld = (v) => {
        const c = Math.cos(heroHead), s = Math.sin(heroHead);
        return [v.x * c + v.y * s, -v.x * s + v.y * c];
      };
      const headingAt = (u) => {
        arrival.getTangentAt(Math.min(1, u), tan2);
        const [x, z] = toWorld(tan2);
        return Math.atan2(x, z);
      };

      // The dossier on the left is what drives the tour now: its own scroll
      // position, handed in from the page, not the window's.
      const scrolled = () => clamp01(progress.current || 0);

      // ── what you clicked ──────────────────────────
      // the named parts answer for themselves; the body is divided by where
      // on it the ray landed, so the tail opens contact and the cabin opens
      // the work
      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const local = new THREE.Vector3();

      const partAt = (hit) => {
        let n = hit.object;
        while (n && n !== car) {
          if (n.name === "Hood") return "stack";
          if (/^Door_/.test(n.name)) return "about";
          if (/^Wheel_/.test(n.name)) return "services";
          n = n.parent;
        }
        // the body itself is read by where on it the ray landed, and every
        // part of it answers for something — a click that does nothing reads
        // as a broken car
        local.copy(hit.point);
        rig.worldToLocal(local);
        if (local.z < -1.6) return "contact";        // tail and pipes
        if (local.z > 0.55) return "stack";          // nose, and what is under it
        if (local.y > 0.45) return "projects";       // the glasshouse
        return "services";                           // flanks and sills
      };

      const pick = (ev) => {
        const r = renderer.domElement.getBoundingClientRect();
        ndc.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
        ndc.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
        ray.setFromCamera(ndc, camera);
        const hits = ray.intersectObject(car, true);
        return hits.length ? partAt(hits[0]) : null;
      };

      const onClick = (ev) => {
        if (!parked) return;
        const part = pick(ev);
        // clicking a part scrolls to its section; the scroll is what moves
        // the lens, so the camera glides there instead of cutting
        if (part) onPart && onPart(PARTS[part] || null);
      };
      const onMove = (ev) => {
        if (!parked) { renderer.domElement.style.cursor = "default"; return; }
        renderer.domElement.style.cursor = pick(ev) ? "pointer" : "default";
      };
      renderer.domElement.addEventListener("click", onClick);
      renderer.domElement.addEventListener("pointermove", onMove, { passive: true });

      // The dock covers the left of the window, so the car would sit half
      // behind it. Shifting the lens' optical centre is how a studio does
      // this: the framing stays correct, the subject moves into what is
      // actually visible. Guessing new camera positions would skew it.
      let shift = 0;
      const dockWidth = () => Math.min(480, window.innerWidth * 0.4);

      let raf = 0, last = performance.now();
      const probe = new URLSearchParams(window.location.search).has("perf")
        ? (d) => { window.__carState = d; } : null;

      const frame = (t) => {
        raf = requestAnimationFrame(frame);
        const gap = t - last;
        const dt = Math.min(gap / 1000, 0.05);
        last = t;
        if (document.hidden) return;

        let p0 = 0;
        if (!parked) {
          // measured against the clock, not summed from frame deltas, so a
          // throttled tab still takes INTRO_MS and no longer
          if (!warmed) introStart = 0;
          else if (!introStart) introStart = t;
          // the first frames stall while the GPU compiles the scene; the
          // clock stops for a stall so the drive is not over before it is seen
          else if (gap > 120) introStart += gap - 16;
          introT = seek !== null ? seek : introStart ? clamp01((t - introStart) / INTRO_MS) : 0;

          if (ENTRANCE === "shutter") {
            // 0.00-0.74  the push in through the haze (2.5s), dim and moody
            // 0.74-0.88  the strips catch: two flashes, then they lock on
            // 0.88-1.00  full illumination, and the page is handed over
            haze.density = 0.22 - 0.205 * ease(clamp01(introT / 0.22));
            // the strips catch as the car comes into the corner, so the
            // slide itself is in the light
            const warm = clamp01((introT - 0.14) / 0.12);
            const striking = introT > 0.15 && introT < 0.27;
            const strike = striking && Math.sin((introT - 0.15) * 105) < -0.25 ? 0.1 : 1;
            for (const m of shop.panels) m.opacity = warm * strike;
            for (const st of strips) st.m.emissiveIntensity = st.full * Math.max(0.04, warm * strike);
            const dim = 0.16 * ease(clamp01(introT / 0.08));
            renderer.toneMappingExposure = Math.max(dim, 1.25 * ease(warm) * strike);

            // ── the drive in ──
            const sec = (introT - DRIVE_START) * INTRO_MS / 1000;
            const along = Math.min(runLen, distAt(sec));
            const speed = speedAt(sec);
            const u = along / runLen;
            spin -= (along - travelled) / wheelR;   // the wheels turn with the ground covered
            travelled = along;
            arrival.getPointAt(u, onPath);
            const [ox, oz] = toWorld(onPath);
            const heading = headingAt(u);
            rig.position.set(MARK[0] + ox, MARK[1], MARK[2] + oz);

            const step = 0.015;
            const bend = turnTo(0, headingAt(u + step) - heading, 1) / (step * runLen);
            const lateralG = (speed * speed * bend) / 9.81;
            // The drift, as a driver does it: a feint away from the corner to
            // load the car (the flick), the tail snapping out to full slide,
            // held round the arc on the throttle, then caught, with the
            // tail swinging a touch past straight before it settles.
            const sm = THREE.MathUtils.smoothstep;
            const feint = sm(along, TURN_IN - 1.2, TURN_IN - 0.4) * (1 - sm(along, TURN_IN - 0.4, TURN_IN + 0.3));
            const out = sm(along, TURN_IN, FULL_SLIDE) * (1 - sm(along, UNWIND, CAUGHT));
            const snap = sm(along, CAUGHT - 0.6, CAUGHT) * (1 - sm(along, CAUGHT, CAUGHT + 1.0));
            const slipWant = -0.14 * feint + SLIDE * out - 0.07 * snap;
            slip = THREE.MathUtils.damp(slip, slipWant, 14, dt);
            // opposite lock: the fronts point down the road while the body
            // is sideways to it
            const pathSteer = speed > 0.05 ? Math.atan(wheelbase * bend) : 0;
            steer = THREE.MathUtils.damp(steer, THREE.MathUtils.clamp(pathSteer - slip * 1.0, -0.7, 0.7), 16, dt);
            // the rears are spinning well past road speed while it slides
            rearSpin -= Math.abs(slip) * 60 * dt;
            // body roll out of the corner, dive under braking, then it
            // rocks back on its springs when it stops
            // roll onto the outside of the slide, a few degrees
            lean = THREE.MathUtils.damp(lean, THREE.MathUtils.clamp(slip * 0.075 + lateralG * 0.01, -0.06, 0.06), 8, dt);
            const braking = sec > cruiseSecs && speed > 0.05;
            dipV += (((braking ? 0.022 : 0) - dip) * 150 - dipV * 8) * dt;
            dip += dipV * dt;
            rig.rotation.set(0, heading + slip, 0);
            chassis.rotation.set(dip, 0, lean);
            pool.position.set(rig.position.x, GROUND + 0.004, rig.position.z);
            pool.rotation.z = heading + slip;
            pool.material.opacity = 0.75 * Math.max(0.35, warm);

            // smoke off the rear tyres: as much as the slide is giving,
            // thrown back along the way the car is travelling
            smokeDue += Math.max(0, Math.abs(slip) - 0.12) * Math.min(1, speed / 5) * 150 * dt;
            if (smokeDue >= 1) {
              const bx = -Math.sin(heading), bz = -Math.cos(heading);
              while (smokeDue >= 1) {
                smokeDue -= 1;
                for (const w of rears) {
                  w.getWorldPosition(puffAt);
                  emitSmoke(puffAt, bx, bz);
                }
              }
            }

            // the DRLs burn through the dark and stay on; the headlight throw
            // goes out a beat after it has stopped
            lamps = 1;
            head = 1;
            beam = 1 - THREE.MathUtils.smoothstep(introT, DRIVE_END + 0.12, DRIVE_END + 0.2);
            // stopped, facing the lens: two flashes of the high beam
            const pulse = (a, b) => (introT > a && introT < b ? Math.sin(Math.PI * (introT - a) / (b - a)) : 0);
            flash = Math.max(pulse(DRIVE_END + 0.03, DRIVE_END + 0.065), pulse(DRIVE_END + 0.085, DRIVE_END + 0.12));

            // ── the lens ──
            // Down on the floor off the front-right of the corner, on a long
            // lens, following the slide a fraction late the way a camera
            // operator does, with a slight tilt while it is sideways. Once the
            // car is stopping it rises and pushes in to the hero stance.
            const shot = TOUR[0];
            const back = dollyFor(camera.aspect);
            const push = ease(clamp01((introT - 0.42) / 0.42));
            const hand = THREE.MathUtils.smoothstep(introT, 0.46, 0.8);
            const tx = rig.position.x, ty = GROUND + 0.5, tz = rig.position.z;
            if (!lens.ready) { lens.x = tx; lens.y = ty; lens.z = tz; lens.ready = true; }
            lens.x = THREE.MathUtils.damp(lens.x, tx, 5.5, dt);
            lens.y = THREE.MathUtils.damp(lens.y, ty, 5.5, dt);
            lens.z = THREE.MathUtils.damp(lens.z, tz, 5.5, dt);
            const follow = [lens.x, lens.y, lens.z];
            // a little of the car's weight comes through the floor
            const shake = Math.abs(slip) * (1 - hand) * 0.006;
            for (let j = 0; j < 3; j += 1) {
              const base = j === 0 ? MARK[0] : j === 1 ? GROUND : MARK[2];
              const heroLook = base + shot.look[j];
              const look = follow[j] + (heroLook - follow[j]) * hand;
              const from = base + FAR[j];
              const to = base + shot.pos[j];
              const pos = from + (to - from) * push + (j === 1 ? Math.sin(t * 0.047) * shake : Math.sin(t * 0.061 + j) * shake);
              camLook.setComponent(j, look);
              camPos.setComponent(j, look + (pos - look) * back);
            }
            const focal = 21 + (shot.fov - 21) * hand;
            if (Math.abs(focal - fov) > 0.01) { fov = focal; camera.fov = fov; camera.updateProjectionMatrix(); }
            roll = -slip * 0.09 * (1 - hand);
          } else {
          const u = warp(introT);

          curve.getPoint(u, here);
          curve.getTangent(u, tan).normalize();
          rig.position.copy(here);

          // it faces the way it is going, and swings onto the hero angle as
          // it stops
          let head = Math.atan2(tan.x, tan.z);
          const settle = clamp01((introT - 0.86) / 0.14);
          if (settle > 0) head = turnTo(head, heroHead, ease(settle));
          rig.rotation.y = head;

          // the wheels turn with the ground covered, not with the clock
          if (havePrev && wheels.length) spin -= here.distanceTo(prev) / wheelR;

          // and the body leans out of the turn: the cross product of where it
          // was pointing and where it points now signs the lean
          let lean = 0;
          if (havePrev && dt > 0) {
            cross.copy(prevTan).cross(tan);
            lean = THREE.MathUtils.clamp(-(cross.y / dt) * 0.04, -0.1, 0.1);
          }
          rig.rotation.z = THREE.MathUtils.damp(rig.rotation.z, lean, 6, dt);
          // weight forward under the brakes, settled by the time it stops
          const pitch = introT > 0.82 && introT < 0.98 ? 0.04 : 0;
          rig.rotation.x = THREE.MathUtils.damp(rig.rotation.x, pitch, 7, dt);

          prev.copy(here);
          prevTan.copy(tan);
          havePrev = true;
          pool.material.opacity = 0.75 * ease(clamp01((introT - 0.7) / 0.3));
          }

          lamps += (1 - lamps) * Math.min(1, dt * 1.6);

          if (!revealed && introT >= REVEAL_AT) { revealed = true; onReveal && onReveal(); }
          if (introT >= 1) {
            parked = true;
            parkedAt = t;
            rig.position.set(MARK[0], MARK[1], MARK[2]);
            rig.rotation.set(0, heroHead, 0);
            chassis.rotation.set(0, 0, 0);
            for (const m of shop.panels) m.opacity = 1;
            for (const st of strips) st.m.emissiveIntensity = st.full;
            pool.position.set(MARK[0], GROUND + 0.004, MARK[2]);
            pool.rotation.z = heroHead;
            steer = 0;
            slip = 0;
            head = 1;
            beam = 0;
            flash = 0;
            renderer.toneMappingExposure = 1.25;
            haze.density = 0.015;
            if (!revealed) { revealed = true; onReveal && onReveal(); }
            onDone && onDone();
          }
        } else {
          // ── where the camera wants to be ──────────────
          const p = scrolled();
          p0 = p;
          tourAt(p0, want);
          const back = dollyFor(camera.aspect);
          for (let i = 0; i < 3; i += 1) {
            // the tour is written against the car; the car stands on the
            // shed floor, a length back from the world origin
            const base = i === 0 ? MARK[0] : i === 1 ? GROUND : MARK[2];
            const look = base + want.look[i];
            const at = look + (base + want.pos[i] - look) * back;
            camPos.setComponent(i, THREE.MathUtils.damp(camPos.getComponent(i), at, 8, dt));
            camLook.setComponent(i, THREE.MathUtils.damp(camLook.getComponent(i), look, 8, dt));
          }
          roll = THREE.MathUtils.damp(roll, want.roll, 8, dt);
          const f = THREE.MathUtils.damp(fov, want.fov, 8, dt);
          if (Math.abs(f - fov) > 0.001) { fov = f; camera.fov = f; camera.updateProjectionMatrix(); }

          rig.position.set(MARK[0], MARK[1], MARK[2]);
          rig.rotation.y = heroHead;
          lamps += (1 - lamps) * Math.min(1, dt * 1.6);
          pool.material.opacity = 0.75;

          // The moving parts run off the same number as the camera, and the
          // bonnet's window is the bonnet shot's own stretch of scroll — a
          // hard-coded range drifts the moment the shots are re-spaced.
          // The bonnet stays shut. The island Blender pulled out as "Hood" is
          // a carbon component, not the painted bonnet skin — that skin is
          // still welded into Body — so swinging it lifted a hidden panel up
          // THROUGH the bodywork, which is the tearing at the wipers and
          // fenders. Opening it needs the painted island cut in Blender too;
          // until then a solid car beats a torn one.
          hoodWant = 0;
          doorWant = 0;
        }

        // the doors are rigged and hinged; nothing in the tour opens them,
        // but ?perf can
        doorOpen += ((doorWant > 0.5 ? 1 : 0) - doorOpen) * Math.min(1, dt * 2.6);
        for (const d of doors) {
          d.node.rotation.y = doorOpen * 0.85 * (d.left ? 1 : -1) * (d.rear ? 0.8 : 1);
        }
        hoodOpen += ((hoodWant > 0.5 ? 1 : 0) - hoodOpen) * Math.min(1, dt * 2.2);
        // the nose is +Z, so turning the hinge the negative way about X
        // lifts the roundel edge and leaves the windscreen edge locked
        for (const w of wheels) w.rotation[lateral] = rears.has(w) ? spin + rearSpin : spin;
        smokeMat.uniforms.uScale.value = renderer.domElement.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
        smokeMat.uniforms.uLight.value = THREE.MathUtils.clamp(renderer.toneMappingExposure / 1.25, 0.25, 1);
        stepSmoke(dt);
        for (const w of fronts) w.rotation.y = steer;
        // the unit behind the glass carries the bar graphic, so that is
        // what is driven hard; the lens itself only catches a little
        // everything comes from the unit behind the filter now
        for (const m of lampMats) m.emissiveIntensity = lamps * 11;
        rig.updateMatrixWorld();
        lampU.uRigInv.value.copy(rig.matrixWorld).invert();
        lampU.uHead.value = head;
        lampU.uYellow.value = beam;
        // the intro holds the room near 16% exposure; the lamps are lit by
        // their own power, not the room's, so they are pushed back up by it
        // capped: pushed further, the bloom spreads it over the whole frame
        const boost = THREE.MathUtils.clamp(1.25 / Math.max(0.05, renderer.toneMappingExposure), 1, 3);
        lampU.uBoost.value = boost * (1 + 0.8 * flash);
        // a real light: the exposure already scales it, so no boost; the wet
        // floor turns anything stronger into a white pool under the bloom
        for (const b of beams) b.intensity = beam * 5 * (1 + 0.9 * flash);
        // hazards: ~1.4Hz, a little over half lit, with the fast rise and
        // short tail of an LED rather than a hard on/off
        const since = parkedAt ? t - parkedAt - 350 : -1;
        // ~1.5Hz, half on, a simple flash, front, mirrors and rear in phase
        const running = since >= 0 && since < 8 * 667;
        const blinkOn = running && (since % 667) < 333;
        blink = THREE.MathUtils.damp(blink, blinkOn ? 1 : 0, blinkOn ? 40 : 22, dt);
        haz = THREE.MathUtils.damp(haz, running ? 1 : 0, 30, dt);
        lampU.uBlink.value = blink;
        lampU.uHaz.value = haz;
        for (const hz of hazards) {
          hz.sp.getWorldPosition(glareAt);
          glareTo.copy(camera.position).sub(glareAt);
          const dist = glareTo.length();
          glareTo.divideScalar(Math.max(1e-4, dist));
          glareFwd.copy(hz.dir).applyQuaternion(rig.quaternion);
          const facing = THREE.MathUtils.smoothstep(glareFwd.dot(glareTo), -0.25, 0.45);
          const size = THREE.MathUtils.clamp(dist * 0.045, 0.05, 0.26);
          if (hz.strip) hz.sp.scale.set(hz.strip, Math.max(0.012, size * 0.12), 1);
          else hz.sp.scale.set(size, size, 1);
          hz.sp.material.opacity = Math.min(1, blink * facing * 0.9);
          hz.sp.visible = hz.sp.material.opacity > 0.003;
        }
        if (glares.length) {
          // strongest in the dark, held back once the room is lit, and back
          // up again as the lens comes close to a lamp; it needs the lamp
          // to be looking roughly toward the camera, as real glare does
          const dark = THREE.MathUtils.clamp(1.6 - renderer.toneMappingExposure, 0.5, 1);
          glareFwd.set(0, 0, 1).applyQuaternion(rig.quaternion);
          for (const gl of glares) {
            gl.core.getWorldPosition(glareAt);
            glareTo.copy(camera.position).sub(glareAt);
            const dist = glareTo.length();
            glareTo.divideScalar(Math.max(1e-4, dist));
            const facing = THREE.MathUtils.smoothstep(glareFwd.dot(glareTo), -0.2, 0.5);
            const near = 1 - THREE.MathUtils.smoothstep(dist, 1.4, 5);
            const k = head * (1 - 0.45 * blink * haz) * facing * Math.max(dark, 0.5 + 0.5 * near) * (1 + 0.6 * flash);
            // a faint shimmer, so it reads as light through glass, not a sticker
            const shimmer = 0.94 + 0.06 * Math.sin(t * 0.0037 + gl.at.x * 9);
            gl.core.material.opacity = Math.min(1, k * 0.35 * shimmer);   // a hot centre; the halo is the bloom
            gl.streak.material.opacity = Math.min(1, k * 0.75 * shimmer);
            // sized against the distance, so up close it stays a glare on
            // the lens rather than a disc that swallows the frame
            const size = THREE.MathUtils.clamp(dist * 0.085, 0.07, 0.46) * (1 + 0.8 * flash);
            gl.core.scale.set(size, size, 1);
            const run = THREE.MathUtils.clamp(dist * 0.42, 0.35, 2.4) * (1 + 0.6 * flash);
            gl.streak.scale.set(run, Math.max(0.01, run * 0.012), 1);
            // warm while the tubes run yellow with the beams
            gl.core.material.color.setRGB(1, 1 - 0.16 * beam, 1 - 0.45 * beam);
            gl.streak.material.color.copy(gl.core.material.color);
            gl.core.visible = gl.streak.visible = k > 0.003;
          }
        }

        // looking straight down at the roof, the usual up vector is the way
        // the camera is pointing, so it hands over to +Z on the way there
        {
          const phone = window.innerWidth < 768;
          const w = Math.max(1, el.clientWidth);
          const h = Math.max(1, el.clientHeight);
          const wanted = phone ? 0 : -dockWidth() * 0.48;
          shift = THREE.MathUtils.damp(shift, wanted, 5, dt);
          if (Math.abs(shift) < 0.5) {
            if (camera.view && camera.view.enabled) { camera.clearViewOffset(); }
          } else {
            camera.setViewOffset(w, h, shift, 0, w, h);
          }
        }

        view.copy(camLook).sub(camPos).normalize();
        const k = THREE.MathUtils.smoothstep(Math.abs(view.y), 0.9, 0.999);
        up.set(0, 1 - k, k).normalize();
        camera.up.copy(up);
        camera.position.copy(camPos);
        camera.lookAt(camLook);
        camera.rotateZ(roll);            // the lean goes on after the aim
        warmStep(t, gap);
        composer.render();

        if (!el.dataset.lit) { el.dataset.lit = "1"; el.style.opacity = "1"; }
        if (probe) {
          const v = new THREE.Vector3();
          rig.getWorldPosition(v);
          v.project(camera);
          probe({
            introT: +introT.toFixed(3), parked, p: +scrolled().toFixed(3),
            car: [+rig.position.x.toFixed(2), +rig.position.z.toFixed(2)],
            ndc: [+v.x.toFixed(2), +v.y.toFixed(2)],
            cam: [+camPos.x.toFixed(2), +camPos.y.toFixed(2), +camPos.z.toFixed(2)],
            fov: +fov.toFixed(1), roll: +roll.toFixed(3),
          });
        }
      };
      raf = requestAnimationFrame(frame);

      const onResize = () => {
        camera.aspect = vw() / vh();
        camera.updateProjectionMatrix();
        renderer.setSize(vw(), vh());
        composer.setSize(vw(), vh());
        bloom.setSize(vw() / 2, vh() / 2);
      };
      window.addEventListener("resize", onResize, { passive: true });

      api.current = {
        wheels: wheels.length, hood: hood ? 1 : 0, lamps: lampMats.length, doors: doors.length,
        length: +new THREE.Box3().setFromObject(car).getSize(new THREE.Vector3()).z.toFixed(3),
        flipped: flip,
        skipIntro: () => { seek = null; warmed = true; introT = 1; introStart = 1; },
        setDoors: (v) => { doorWant = v; },
      };
      if (probe) {
        window.__car = api.current;
        window.__carRoot = car;
        window.__carSeek = (v) => { seek = v; parked = false; };   // step the entrance by hand
      }
      mark("ready");

      dispose = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        renderer.domElement.removeEventListener("click", onClick);
        renderer.domElement.removeEventListener("pointermove", onMove);

        scene.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        });
        env.dispose();
        composer.dispose();
        renderer.dispose();
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      };
    })();

    return () => { alive = false; dispose(); };
  }, [armed]);


  return <div ref={host} className="car-stage" data-state="idle" aria-hidden="true" />;
}

export const CAR_CSS = `
  .car-stage{position:fixed;inset:0;width:100vw;height:100svh;z-index:0;pointer-events:auto;opacity:0;transition:opacity 1.1s ease}
  .car-stage canvas{display:block;width:100%;height:100%}

`;
