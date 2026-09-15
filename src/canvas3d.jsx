import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────
   WIREFRAME 3D — canvas 2D, no library.

   Real geometry and a real perspective projection: a geodesic
   sphere built by subdividing an icosahedron, an inner core, and
   a ring of orbiting points. Edges are depth-sorted and faded by
   z, so the solid reads as volume rather than as a flat outline.

   Scroll drives it — the sphere spins up, pushes its vertices
   outward, and recedes as the hero leaves — which is why this is
   a canvas and not an SVG.
   ───────────────────────────────────────────────────────── */

const ICO_FACES = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
];

function normalise(v) {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

/** Subdivided icosahedron → { verts, edges }. */
function icosphere(subdivisions) {
  const t = (1 + Math.sqrt(5)) / 2;
  const verts = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ].map(normalise);

  let faces = ICO_FACES;

  for (let s = 0; s < subdivisions; s += 1) {
    const cache = new Map();
    const next = [];

    const midpoint = (a, b) => {
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      const hit = cache.get(key);
      if (hit !== undefined) return hit;
      const va = verts[a];
      const vb = verts[b];
      verts.push(normalise([(va[0] + vb[0]) / 2, (va[1] + vb[1]) / 2, (va[2] + vb[2]) / 2]));
      const idx = verts.length - 1;
      cache.set(key, idx);
      return idx;
    };

    for (const [a, b, c] of faces) {
      const ab = midpoint(a, b);
      const bc = midpoint(b, c);
      const ca = midpoint(c, a);
      next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    faces = next;
  }

  const seen = new Set();
  const edges = [];
  for (const [a, b, c] of faces) {
    for (const [x, y] of [[a, b], [b, c], [c, a]]) {
      const key = x < y ? `${x}:${y}` : `${y}:${x}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([x, y]);
      }
    }
  }
  return { verts, edges };
}

export function Wireframe({ reduced = false, mobile = false, style = {} }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const shell = icosphere(mobile ? 1 : 2);
    const core = icosphere(0);

    // a loose belt of points on inclined orbits
    const motes = Array.from({ length: mobile ? 26 : 46 }, (_, i) => ({
      radius: 1.35 + Math.random() * 0.55,
      speed: 0.12 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
      tilt: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 1.4 + 0.5,
    }));

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let visible = true;

    // input state, tracked here so the render loop owns one source of truth
    let scrollP = 0;
    let pmx = 0, pmy = 0, tmx = 0, tmy = 0;
    let spin = 0;
    let t0 = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointer = (e) => {
      tmx = (e.clientX / window.innerWidth) * 2 - 1;
      tmy = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const onScroll = () => {
      const vh = window.innerHeight || 1;
      scrollP = Math.max(0, Math.min(1.4, window.scrollY / vh));
    };

    // rotate around Y then X
    const rot = (v, ax, ay) => {
      const cy = Math.cos(ay);
      const sy = Math.sin(ay);
      const x1 = v[0] * cy + v[2] * sy;
      const z1 = -v[0] * sy + v[2] * cy;
      const cx = Math.cos(ax);
      const sx = Math.sin(ax);
      return [x1, v[1] * cx - z1 * sx, v[1] * sx + z1 * cx];
    };

    const FOV = 3.2;

    const project = (v, radius, cx, cy) => {
      // camera sits at z = -FOV looking down +z
      const denom = FOV + v[2];
      const k = FOV / (denom <= 0.15 ? 0.15 : denom);
      return [cx + v[0] * radius * k, cy + v[1] * radius * k, k];
    };

    const drawSolid = (geom, radius, cx, cy, ax, ay, explode, opts) => {
      const projected = geom.verts.map((v) => {
        const s = explode;
        const r = rot([v[0] * s, v[1] * s, v[2] * s], ax, ay);
        return { p: project(r, radius, cx, cy), z: r[2] };
      });

      // far edges first so near ones sit on top
      const order = geom.edges
        .map(([a, b]) => ({ a, b, z: (projected[a].z + projected[b].z) / 2 }))
        .sort((m, n) => m.z - n.z);

      for (const e of order) {
        const A = projected[e.a].p;
        const B = projected[e.b].p;
        // depth → opacity. back of the sphere nearly vanishes.
        const d = (e.z + 1) / 2; // 0 far → 1 near
        const alpha = (0.05 + d * d * 0.55) * opts.alpha;
        if (alpha < 0.012) continue;
        ctx.strokeStyle = `rgba(${opts.rgb},${alpha.toFixed(3)})`;
        ctx.lineWidth = 0.55 + d * 0.75;
        ctx.beginPath();
        ctx.moveTo(A[0], A[1]);
        ctx.lineTo(B[0], B[1]);
        ctx.stroke();
      }

      if (opts.vertices) {
        for (const v of projected) {
          const d = (v.z + 1) / 2;
          if (d < 0.45) continue;
          const alpha = (d - 0.45) * 1.3 * opts.alpha;
          ctx.fillStyle = `rgba(${opts.vertRgb || opts.rgb},${alpha.toFixed(3)})`;
          const s = 1 + d * 1.1;
          ctx.fillRect(v.p[0] - s / 2, v.p[1] - s / 2, s, s);
        }
      }
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;

      const dt = Math.min(64, now - t0);
      t0 = now;

      pmx += (tmx - pmx) * 0.06;
      pmy += (tmy - pmy) * 0.06;

      // scroll spins it up and pushes the vertices apart
      spin += (0.00016 + scrollP * 0.0011) * dt;

      const fade = Math.max(0, 1 - scrollP * 0.85);
      ctx.clearRect(0, 0, w, h);
      if (fade <= 0.01) return;

      const cx = w / 2;
      const cy = h / 2 + scrollP * h * 0.16;
      const radius = Math.min(w, h) * (mobile ? 0.3 : 0.33) * (1 - scrollP * 0.12);

      const ax = pmy * 0.55 + Math.sin(now * 0.00013) * 0.16;
      const ay = spin + pmx * 0.7;
      const explode = 1 + scrollP * 0.55;

      drawSolid(shell, radius, cx, cy, ax, ay, explode, {
        rgb: "96,150,255", vertRgb: "150,190,255", alpha: fade * 0.9, vertices: true,
      });

      drawSolid(core, radius * 0.42, cx, cy, -ax * 1.4, -ay * 1.7, 1 + scrollP * 0.3, {
        rgb: "44,100,255", alpha: fade, vertices: false,
      });

      // orbiting motes
      const tsec = now * 0.001;
      for (const m of motes) {
        const a = m.phase + tsec * m.speed * (1 + scrollP);
        const v = rot(
          [Math.cos(a) * m.radius, Math.sin(a) * m.radius * Math.sin(m.tilt), Math.sin(a) * m.radius * Math.cos(m.tilt)],
          ax, ay
        );
        const p = project(v, radius, cx, cy);
        const d = (v[2] + 1.6) / 3.2;
        const alpha = Math.max(0, d) * 0.7 * fade;
        if (alpha < 0.02) continue;
        ctx.fillStyle = `rgba(140,185,255,${alpha.toFixed(3)})`;
        const s = m.size * (0.5 + d);
        ctx.fillRect(p[0] - s / 2, p[1] - s / 2, s, s);
      }
    };

    resize();
    onScroll();

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(canvas);

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    if (!reduced) window.addEventListener("mousemove", onPointer, { passive: true });

    if (reduced) {
      // one static frame, no loop
      t0 = performance.now();
      const once = () => {
        ctx.clearRect(0, 0, w, h);
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.32;
        drawSolid(shell, radius, cx, cy, 0.3, 0.6, 1, { rgb: "96,150,255", vertRgb: "150,190,255", alpha: 0.8, vertices: true });
        drawSolid(core, radius * 0.42, cx, cy, -0.4, -1, 1, { rgb: "44,100,255", alpha: 0.9, vertices: false });
      };
      once();
      window.addEventListener("resize", once);
      return () => {
        io.disconnect();
        window.removeEventListener("resize", resize);
        window.removeEventListener("resize", once);
        window.removeEventListener("scroll", onScroll);
      };
    }

    raf = requestAnimationFrame(frame);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onPointer);
    };
  }, [reduced, mobile]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none", ...style }}
    />
  );
}
