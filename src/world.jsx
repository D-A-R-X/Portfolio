import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────
   THE WORLD — a pinned scene the opening chapters scroll over.

   Two parts:
   1. A particle field in raw WebGL (no library). Every particle
      carries its position in five shapes as vertex attributes;
      the vertex shader blends between them, so morphing ~9,000
      particles costs the CPU a few uniform writes a frame. The
      pointer adds real physics on top (see createPhysics).
   2. A landscape in SVG layers — sky, cloud banks, far range,
      rocks, a lake with their reflection, a near hill — moved at
      different depths as you scroll. Transform-only.
   ───────────────────────────────────────────────────────── */

/* ─── shape builders — each returns Float32Array(n * 3) ─── */

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function glyph(char, n, font, seed) {
  const S = 260;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const x = c.getContext("2d", { willReadFrequently: true });
  x.fillStyle = "#000";
  x.strokeStyle = "#000";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.font = `italic 210px ${font}`;
  // Instrument Serif has hairline strokes; sampled as-is the monogram reads as
  // a faint outline. Stroking it first gives the particles a body to fill.
  x.lineWidth = 11;
  x.lineJoin = "round";
  x.strokeText(char, S / 2, S / 2 + 10);
  x.fillText(char, S / 2, S / 2 + 10);
  const data = x.getImageData(0, 0, S, S).data;
  const px = [];
  let minX = S, maxX = 0, minY = S, maxY = 0;
  for (let y = 0; y < S; y += 2) {
    for (let xx = 0; xx < S; xx += 2) {
      if (data[(y * S + xx) * 4 + 3] > 140) {
        px.push(xx, y);
        if (xx < minX) minX = xx; if (xx > maxX) maxX = xx;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  const k = px.length / 2;
  if (!k) return sphere(n, seed);
  // Normalise to the same height as the other shapes (±1.1), keeping the
  // glyph's own proportions, so it holds the stage the way the sphere does.
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const scale = 2.3 / Math.max(1, maxY - minY);
  const out = new Float32Array(n * 3);
  const r = rng(seed);
  for (let i = 0; i < n; i += 1) {
    const j = ((r() * k) | 0) * 2;
    out[i * 3] = (px[j] - cx) * scale + (r() - 0.5) * 0.03;
    out[i * 3 + 1] = -(px[j + 1] - cy) * scale + (r() - 0.5) * 0.03;
    out[i * 3 + 2] = (r() - 0.5) * 0.36;
  }
  return out;
}

function slab(n, seed) {
  const r = rng(seed);
  const out = new Float32Array(n * 3);
  const W = 0.78, H = 1.05, D = 0.24, R = 0.22;
  for (let i = 0; i < n; ) {
    const x = (r() * 2 - 1) * W, y = (r() * 2 - 1) * H, z = (r() * 2 - 1) * D;
    const cx = Math.max(Math.abs(x) - (W - R), 0), cy = Math.max(Math.abs(y) - (H - R), 0);
    if (cx * cx + cy * cy > R * R) continue; // round the corners
    out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z;
    i += 1;
  }
  return out;
}

function sphere(n, seed) {
  const r = rng(seed);
  const out = new Float32Array(n * 3);
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i += 1) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = g * i;
    const s = 1.02 * (0.86 + r() * 0.14); // a thick shell, not a hard surface
    out[i * 3] = Math.cos(th) * rad * s;
    out[i * 3 + 1] = y * s;
    out[i * 3 + 2] = Math.sin(th) * rad * s;
  }
  return out;
}

function torus(n, seed) {
  const r = rng(seed);
  const out = new Float32Array(n * 3);
  const R = 0.92, tube = 0.36;
  for (let i = 0; i < n; i += 1) {
    const u = r() * Math.PI * 2, v = r() * Math.PI * 2;
    const t = tube * Math.sqrt(r());
    out[i * 3] = (R + t * Math.cos(v)) * Math.cos(u);
    out[i * 3 + 1] = (R + t * Math.cos(v)) * Math.sin(u);
    out[i * 3 + 2] = t * Math.sin(v);
  }
  return out;
}

/* ─── shaders (GLSL ES 1.0, so it runs on WebGL1 everywhere) ─── */

const VERT = `
attribute vec3 aA, aB, aC, aD, aE;
attribute vec4 aR; // x delay, y size, z tone, w phase
// per-particle physics from the CPU: xy offset (x in aspect-corrected
// units), z glow. Zero for every particle until the pointer disturbs one.
attribute vec3 aOff;
uniform float uMorph, uTime, uAspect, uDpr, uSize, uScale;
uniform vec2 uTilt, uOffset;
varying float vA;
varying float vT;
varying float vG;

vec3 pick(float k) {
  if (k < 0.5) return aA;
  if (k < 1.5) return aB;
  if (k < 2.5) return aC;
  if (k < 3.5) return aD;
  return aE;
}
mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }

void main() {
  float seg = floor(min(uMorph, 3.999));
  float t = uMorph - seg;
  // each particle leaves on its own delay, so shapes dissolve rather than snap
  float lt = clamp((t - aR.x * 0.42) / 0.58, 0.0, 1.0);
  float e = lt * lt * (3.0 - 2.0 * lt);
  vec3 p = mix(pick(seg), pick(seg + 1.0), e);

  // mid-flight, particles bloom outward, then settle into the next shape
  p += normalize(p + vec3(0.0001)) * sin(e * 3.14159) * (0.22 + aR.w * 0.4);

  float ph = aR.w * 6.2831;
  p += 0.02 * vec3(sin(uTime * 0.9 + ph + p.y * 3.0), cos(uTime * 0.8 + ph + p.x * 3.0), sin(uTime * 0.7 + ph));

  // a slow sway rather than a full spin: the monograms are flat, and a full
  // turn would show them edge-on as a thin column for a few seconds
  p = rotX(0.1 + uTilt.y * 0.22) * rotY(sin(uTime * 0.21) * 0.5 + uTilt.x * 0.42) * p;

  float depth = 3.6 - p.z;
  vec2 proj = p.xy * (2.2 / depth) * uScale;
  proj.x /= uAspect;

  float g = aOff.z;
  gl_Position = vec4(proj + uOffset + vec2(aOff.x / uAspect, aOff.y), 0.0, 1.0);
  // a disturbed particle swells to make room for its halo
  gl_PointSize = aR.y * uSize * uDpr * (3.2 / depth) * (1.0 + g * 1.6);
  vG = g;
  vA = max(0.5 + 0.5 * clamp((p.z + 1.1) / 2.2, 0.0, 1.0), g);
  vT = aR.z;
}`;

const FRAG = `
precision mediump float;
varying float vA;
varying float vT;
varying float vG;
uniform float uFade;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c);
  if (d > 0.25) discard;
  vec3 deep = vec3(0.09, 0.26, 0.80);
  vec3 mid  = vec3(0.20, 0.43, 0.96);
  vec3 lite = vec3(0.60, 0.74, 1.00);
  vec3 col = vT < 0.5 ? mix(deep, mid, vT * 2.0) : mix(mid, lite, (vT - 0.5) * 2.0);
  if (vT > 0.94) col = vec3(1.0);

  // at rest: a solid dot. Disturbed: a white-hot core inside a soft blue
  // halo, so a spray of particles reads as light rather than as grit
  float disc = 1.0 - smoothstep(0.08, 0.25, d);
  float core = 1.0 - smoothstep(0.0, 0.06, d);
  float halo = exp(-d * 15.0);
  float a = mix(disc, max(core, halo * 0.55), vG) * vA * uFade;
  vec3 hot = mix(vec3(0.42, 0.6, 1.0), vec3(0.95, 0.97, 1.0), core);
  col = mix(col, hot, vG);
  gl_FragColor = vec4(col, a);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(log || "shader compile failed");
  }
  return s;
}

/* ─── pointer physics ────────────────────────────────────────
   Every particle has an offset from its place in the shape and a
   velocity. The pointer pushes (a gentle pressure while hovering, a
   kick proportional to its speed, a drag along its direction of
   travel and a little swirl); a spring pulls each particle home and
   damping bleeds the energy off, so they overshoot slightly and
   settle. Mass varies per particle, so a sweep sprays rather than
   shoves. Units are clip space with x scaled by aspect, so the
   field is round on any screen.

   The loop only touches particles when the pointer is over the
   canvas or something is still moving; at rest it costs nothing. */

const PHYS = {
  radius: 0.16,      // influence radius
  hover: 0.0011,     // steady outward pressure under a resting pointer
  kick: 0.11,        // outward push per unit of pointer speed
  wind: 0.1,         // share of the pointer's velocity passed on
  swirl: 0.06,       // sideways push per unit of pointer speed
  spring: 0.012,     // pull home per frame
  damping: 0.93,     // velocity kept per frame
  maxKick: 0.012,    // most velocity one frame can add
  maxOff: 0.45,
};

function createPhysics(n, shapes, rnd) {
  const off = new Float32Array(n * 3);   // x, y, glow — uploaded as aOff
  const vel = new Float32Array(n * 2);
  const base = new Float32Array(n * 2);  // cached rest position on screen
  const inv = new Float32Array(n);       // 1 / mass
  const spin = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    inv[i] = 0.55 + rnd[i * 4] * 0.9;
    spin[i] = rnd[i * 4 + 3] < 0.5 ? -1 : 1;
  }
  let awake = false, tick = 0, fresh = false;

  // where the shader puts each particle at rest, minus the tiny wobble. The
  // shape drifts slowly (sway, eased morph), so this is refreshed every few
  // steps rather than every step.
  const project = ({ morph, time, tx, ty, aspect, scale, ox, oy }) => {
    const seg = Math.floor(Math.min(morph, 3.999));
    const t = morph - seg;
    const A = shapes[seg], B = shapes[Math.min(seg + 1, 4)];
    const ry = Math.sin(time * 0.21) * 0.5 + tx * 0.42, rx = 0.1 + ty * 0.22;
    const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
    const offX = ox * aspect;
    for (let i = 0; i < n; i += 1) {
      const i3 = i * 3;
      const lt = Math.min(1, Math.max(0, (t - rnd[i * 4] * 0.42) / 0.58));
      const e = lt * lt * (3 - 2 * lt);
      let x = A[i3] + (B[i3] - A[i3]) * e;
      let y = A[i3 + 1] + (B[i3 + 1] - A[i3 + 1]) * e;
      let z = A[i3 + 2] + (B[i3 + 2] - A[i3 + 2]) * e;
      if (e > 0 && e < 1) {
        const bloom = Math.sin(e * Math.PI) * (0.22 + rnd[i * 4 + 3] * 0.4) / (Math.sqrt(x * x + y * y + z * z) + 1e-4);
        x += x * bloom; y += y * bloom; z += z * bloom;
      }
      const x1 = cy * x + sy * z, z1 = -sy * x + cy * z;
      const y2 = cx * y - sx * z1, z2 = sx * y + cx * z1;
      const k = (2.2 / (3.6 - z2)) * scale;
      base[i * 2] = x1 * k + offX;
      base[i * 2 + 1] = y2 * k + oy;
    }
    fresh = true;
  };

  /**
   * One 60 Hz step. `view` carries the same numbers the vertex shader
   * gets; `ptr` is the pointer in aspect-corrected clip space with its
   * velocity, or null when it is away. Returns true when offsets changed.
   */
  const step = (view, ptr) => {
    if (!ptr) fresh = false;
    if (!ptr && !awake) return false;
    if (ptr && (!fresh || tick % 6 === 0)) project(view);
    tick += 1;

    const R2 = PHYS.radius * PHYS.radius, reach = R2 * 9;
    let speed = 0, mx = 0, my = 0, vx = 0, vy = 0;
    if (ptr) {
      mx = ptr.x; my = ptr.y; vx = ptr.vx; vy = ptr.vy;
      speed = Math.sqrt(vx * vx + vy * vy);
    }
    const push0 = PHYS.hover + speed * PHYS.kick;
    const sw0 = speed * PHYS.swirl;
    let energy = 0;

    for (let i = 0; i < n; i += 1) {
      const i2 = i * 2, i3 = i * 3;
      let px = off[i3], py = off[i3 + 1], g = off[i3 + 2];
      let ux = vel[i2], uy = vel[i2 + 1];
      let hit = false;

      if (ptr) {
        const dx = base[i2] + px - mx;
        const dy = base[i2 + 1] + py - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < reach) {
          hit = true;
          const f = Math.exp(-d2 / R2) * inv[i];
          const r = 1 / Math.sqrt(d2 + 1e-4);
          const sw = sw0 * f * spin[i];
          let ax = dx * r * push0 * f + vx * PHYS.wind * f - dy * r * sw;
          let ay = dy * r * push0 * f + vy * PHYS.wind * f + dx * r * sw;
          const am = Math.sqrt(ax * ax + ay * ay);
          if (am > PHYS.maxKick) { ax *= PHYS.maxKick / am; ay *= PHYS.maxKick / am; }
          ux += ax; uy += ay;
        }
      }
      // a particle at home and untouched has nothing to do
      if (!hit && px === 0 && py === 0 && ux === 0 && uy === 0 && g === 0) continue;

      ux = (ux - px * PHYS.spring) * PHYS.damping;
      uy = (uy - py * PHYS.spring) * PHYS.damping;
      px += ux; py += uy;
      let m = Math.sqrt(px * px + py * py);
      if (m > PHYS.maxOff) { px *= PHYS.maxOff / m; py *= PHYS.maxOff / m; m = PHYS.maxOff; }
      // glow follows speed quickly and cools slowly
      const heat = Math.min(1, Math.sqrt(ux * ux + uy * uy) * 60 + m * 2.2);
      g = heat > g ? g + (heat - g) * 0.5 : g * 0.955;
      const e = Math.abs(ux) + Math.abs(uy) + m + g * 0.01;
      if (e < 1e-5) { px = 0; py = 0; ux = 0; uy = 0; g = 0; }
      vel[i2] = ux; vel[i2 + 1] = uy;
      off[i3] = px; off[i3 + 1] = py; off[i3 + 2] = g;
      energy += e;
    }

    if (!ptr && energy / n < 2e-5) {
      off.fill(0);
      vel.fill(0);
      awake = false;
      return true; // upload the zeros once
    }
    awake = true;
    return true;
  };

  return { off, step, get awake() { return awake; } };
}

/**
 * Builds the particle system on `canvas`. Returns null when WebGL is not
 * available, and the page simply shows the landscape without particles.
 */
export async function createParticles(canvas, { mobile }) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: "high-performance" });
  if (!gl) return null;

  const n = mobile ? 4200 : 9000;
  let font = "Georgia, serif";
  try {
    if (document.fonts) {
      await Promise.race([
        document.fonts.load("italic 210px 'Instrument Serif'"),
        new Promise((r) => setTimeout(r, 1500)),
      ]);
      if (document.fonts.check("italic 210px 'Instrument Serif'")) font = "'Instrument Serif', Georgia, serif";
    }
  } catch { /* fall back to Georgia */ }

  const shapes = [glyph("S", n, font, 11), slab(n, 23), sphere(n, 37), torus(n, 41), glyph("C", n, font, 53)];

  const r = rng(97);
  const rnd = new Float32Array(n * 4);
  for (let i = 0; i < n; i += 1) {
    rnd[i * 4] = r();
    rnd[i * 4 + 1] = 0.55 + r() * r() * 1.6;
    rnd[i * 4 + 2] = r();
    rnd[i * 4 + 3] = r();
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const bind = (name, data, size, usage = gl.STATIC_DRAW) => {
    const loc = gl.getAttribLocation(prog, name);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    return buf;
  };
  const buffers = ["aA", "aB", "aC", "aD", "aE"].map((a, i) => bind(a, shapes[i], 3));
  buffers.push(bind("aR", rnd, 4));
  const phys = createPhysics(n, shapes, rnd);
  const offBuf = bind("aOff", phys.off, 3, gl.DYNAMIC_DRAW);
  buffers.push(offBuf);

  const U = {};
  for (const u of ["uMorph", "uTime", "uAspect", "uDpr", "uSize", "uScale", "uTilt", "uOffset", "uFade"]) {
    U[u] = gl.getUniformLocation(prog, u);
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  let w = 1, h = 1, dpr = 1;
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = Math.max(1, Math.round(rect.width * dpr));
    h = Math.max(1, Math.round(rect.height * dpr));
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  };

  // the numbers both the shader and the physics need for a frame
  const view = (morph, time, tx, ty) => {
    const aspect = w / h;
    const small = aspect < 0.8;
    // desktop: the shape sits right of centre so the left-aligned copy stays
    // clear. Phones: there is no free column, so it floats higher, smaller
    // and softer, and the copy it passes behind stays readable
    return {
      morph, time, tx, ty, aspect, small,
      scale: small ? 0.5 : 0.58,
      ox: small ? 0.08 : 0.34,
      oy: small ? 0.44 : 0.12,
    };
  };

  /** Advances the physics; `ptr` is in aspect-corrected clip space. */
  const simulate = (morph, time, tx, ty, ptr) => {
    if (phys.step(view(morph, time, tx, ty), ptr)) {
      gl.bindBuffer(gl.ARRAY_BUFFER, offBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, phys.off);
    }
  };

  const render = (morph, time, tx, ty, fade) => {
    const v = view(morph, time, tx, ty);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(U.uMorph, morph);
    gl.uniform1f(U.uTime, time);
    gl.uniform1f(U.uAspect, v.aspect);
    gl.uniform1f(U.uDpr, dpr);
    gl.uniform1f(U.uSize, v.small ? 2.6 : 3.1);
    gl.uniform1f(U.uScale, v.scale);
    gl.uniform2f(U.uTilt, tx, ty);
    gl.uniform2f(U.uOffset, v.ox, v.oy);
    gl.uniform1f(U.uFade, v.small ? fade * 0.6 : fade);
    gl.drawArrays(gl.POINTS, 0, n);
  };

  /** Pointer position in the space the physics works in. */
  const toSim = (clientX, clientY, rect) => {
    const aspect = w / h;
    return [(((clientX - rect.left) / rect.width) * 2 - 1) * aspect, 1 - ((clientY - rect.top) / rect.height) * 2];
  };

  const destroy = () => {
    buffers.forEach((b) => gl.deleteBuffer(b));
    gl.deleteProgram(prog);
  };

  resize();
  return { gl, n, resize, render, simulate, toSim, phys, destroy };
}

/* ─── landscape ──────────────────────────────────────────── */

function ridge({ seed, base, amp, n, sharp = false, W = 1600, H = 520 }) {
  const r = rng(seed);
  let d = `M0 ${H} L0 ${base}`;
  for (let i = 0; i <= n; i += 1) {
    const x = (i / n) * W;
    if (sharp) {
      // pillar-like rocks: a flat valley, then a narrow jagged peak
      const peak = base - (0.35 + r() * 0.65) * amp;
      d += ` L${(x - W / n * 0.34).toFixed(1)} ${(base - r() * amp * 0.12).toFixed(1)}`;
      d += ` L${(x - W / n * 0.14).toFixed(1)} ${(peak + r() * 16).toFixed(1)}`;
      d += ` L${(x + W / n * 0.06).toFixed(1)} ${peak.toFixed(1)}`;
      d += ` L${(x + W / n * 0.2).toFixed(1)} ${(base - r() * amp * 0.1).toFixed(1)}`;
    } else {
      d += ` L${x.toFixed(1)} ${(base - r() * amp).toFixed(1)}`;
    }
  }
  return `${d} L${W} ${H} Z`;
}

function hill({ seed, base, amp, W = 1600, H = 520, tufts = 0 }) {
  const r = rng(seed);
  const pts = [];
  for (let i = 0; i <= 8; i += 1) pts.push([(i / 8) * W, base - r() * amp]);
  let d = `M0 ${H} L${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i += 1) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    d += ` Q${px + (x - px) / 2} ${py} ${(px + x) / 2} ${(py + y) / 2} T${x} ${y}`;
  }
  d += ` L${W} ${H} Z`;
  // grass: small blades along the top edge
  let g = "";
  for (let i = 0; i < tufts; i += 1) {
    const x = r() * W;
    const seg = Math.min(pts.length - 2, Math.floor((x / W) * 8));
    const [x0, y0] = pts[seg], [x1, y1] = pts[seg + 1];
    const y = y0 + ((x - x0) / (x1 - x0)) * (y1 - y0) + 4;
    const hgt = 8 + r() * 18;
    g += `M${x.toFixed(1)} ${y.toFixed(1)} L${(x + 2.5).toFixed(1)} ${(y - hgt).toFixed(1)} L${(x + 5).toFixed(1)} ${y.toFixed(1)} Z `;
  }
  return { d, g };
}

const FAR = ridge({ seed: 3, base: 300, amp: 70, n: 16 });
const ROCKS = ridge({ seed: 7, base: 330, amp: 150, n: 11, sharp: true });
const NEAR = hill({ seed: 13, base: 420, amp: 70, tufts: 220 });

export function Landscape({ layers }) {
  const L = (i) => (el) => { layers.current[i] = el; };
  const svg = { position: "absolute", left: "-5%", width: "110%", bottom: 0, height: "62%", display: "block" };
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", background: "linear-gradient(180deg, #c7d9ff 0%, #dde8ff 38%, #f1f6ff 62%, #f7faff 100%)" }}>
      {/* sun glow */}
      <div ref={L(0)} style={{ position: "absolute", left: "50%", top: "14%", width: "70vmax", height: "70vmax", marginLeft: "-35vmax", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.95) 0%, rgba(255,255,255,0) 58%)" }} />
      {/* cloud banks */}
      <div ref={L(1)} style={{ position: "absolute", inset: 0 }}>
        {[["-8%", "8%", 46, 16], ["58%", "3%", 52, 14], ["26%", "30%", 40, 10], ["72%", "34%", 34, 9]].map(([x, y, w, hh], i) => (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: `${w}vw`, height: `${hh}vw`, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 60%, rgba(255,255,255,.9) 0%, rgba(255,255,255,.5) 40%, rgba(255,255,255,0) 70%)" }} />
        ))}
      </div>
      {/* far range */}
      <svg ref={L(2)} viewBox="0 0 1600 520" preserveAspectRatio="xMidYMax slice" style={svg}>
        <path d={FAR} fill="#c6d5f5" />
      </svg>
      {/* rocks + lake + reflection */}
      <svg ref={L(3)} viewBox="0 0 1600 520" preserveAspectRatio="xMidYMax slice" style={svg}>
        <defs>
          <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d6e3fd" />
            <stop offset="1" stopColor="#eef4ff" />
          </linearGradient>
        </defs>
        <path d={ROCKS} fill="#9fb7ea" />
        <rect x="0" y="330" width="1600" height="190" fill="url(#lake)" />
        <path d={ROCKS} fill="#9fb7ea" opacity=".28" transform="translate(0 660) scale(1 -1)" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={120 + i * 380} y={352 + i * 22} width={220 - i * 30} height="1.5" fill="#ffffff" opacity=".7" />
        ))}
      </svg>
      {/* near hill with grass */}
      <svg ref={L(4)} viewBox="0 0 1600 520" preserveAspectRatio="xMidYMax slice" style={{ ...svg, height: "58%" }}>
        <path d={NEAR.d} fill="#5d86e6" />
        <path d={NEAR.g} fill="#5d86e6" />
      </svg>
      {/* petals drifting across the whole frame */}
      <div ref={L(5)} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 14 }, (_, i) => (
          <span
            key={i}
            className="petal"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 60}%`,
              width: 6 + (i % 4) * 2,
              height: 4 + (i % 3) * 2,
              background: i % 3 ? "#ffffff" : "#9db8f2",
              animationDuration: `${14 + (i % 5) * 3}s`,
              animationDelay: `${-i * 1.7}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * The particle canvas. `morphRef.current` is the target morph (0..4), set by
 * the scroll scrubber; the loop eases toward it so scrolling feels weighted.
 */
export function Particles({ morphRef, mobile, reduced, visibleRef }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let sys = null;
    let raf = 0;
    let alive = true;
    let morph = morphRef.current || 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let fade = 0, fadeFrom = 0;
    let acc = 0, last = 0;
    const t0 = performance.now();

    // pointer (or finger) in client px; null when it is away
    let cX = null, cY = null;
    let ptr = null;             // { x, y, vx, vy } in physics space
    const aim = (x, y) => { cX = x; cY = y; };
    const away = () => { cX = null; };

    const onPointer = (e) => {
      if (e.pointerType === "mouse") {
        tx = (e.clientX / window.innerWidth) * 2 - 1;
        ty = (e.clientY / window.innerHeight) * 2 - 1;
      }
      aim(e.clientX, e.clientY);
    };
    const onOut = (e) => { if (!e.relatedTarget) away(); };
    const onTouch = (e) => { const t = e.touches[0]; if (t) aim(t.clientX, t.clientY); };
    const onResize = () => sys && sys.resize();

    const track = () => {
      if (cX === null) { ptr = null; return; }
      const rect = canvas.getBoundingClientRect();
      if (cY < rect.top || cY > rect.bottom) { ptr = null; return; }
      const [x, y] = sys.toSim(cX, cY, rect);
      if (!ptr) { ptr = { x, y, vx: 0, vy: 0 }; return; }
      // velocity is smoothed a little so a single jittery event can't detonate
      ptr.vx += (x - ptr.x - ptr.vx) * 0.6;
      ptr.vy += (y - ptr.y - ptr.vy) * 0.6;
      ptr.x = x; ptr.y = y;
    };

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (!sys || document.hidden || (visibleRef && visibleRef.current === false)) { last = now; return; }
      morph += ((morphRef.current || 0) - morph) * 0.08;
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      // time-based, so the fade-in takes the same ~1.2s at any frame rate
      if (!fadeFrom) fadeFrom = now;
      const k = Math.min(1, (now - fadeFrom) / 1200);
      fade = 1 - (1 - k) * (1 - k) * (1 - k);
      const time = (now - t0) / 1000;

      // physics at a fixed 60 Hz, whatever the display does
      acc = Math.min(acc + (last ? now - last : 16.7), 50);
      last = now;
      if (acc >= 16.7) {
        track();
        while (acc >= 16.7) { sys.simulate(morph, time, cx, cy, ptr); acc -= 16.7; }
      }
      sys.render(morph, time, cx, cy, fade);
    };

    createParticles(canvas, { mobile }).then((s) => {
      if (!alive || !s) return;
      sys = s;
      if (reduced) {
        sys.render(0, 0, 0, 0, 1);
        return;
      }
      raf = requestAnimationFrame(loop);
      if (new URLSearchParams(window.location.search).has("perf")) {
        window.__particleBench = (frames = 120) => {
          const a = performance.now();
          for (let i = 0; i < frames; i += 1) sys.render(i / 40, i / 60, 0.2, 0.1, 1);
          sys.gl.finish();
          return +((performance.now() - a) / frames).toFixed(3);
        };
        // drags a pointer across the canvas for `frames` physics steps, from
        // (x0,y0) to (x1,y1) in client px, then renders one frame and reads
        // it back. Returns the step cost and what the particles did.
        window.__particleSweep = (x0, y0, x1, y1, frames = 30, settle = 0) => {
          const rect = canvas.getBoundingClientRect();
          let p = null, cost = 0;
          for (let i = 0; i <= frames + settle; i += 1) {
            let q = null;
            if (i <= frames) {
              const [x, y] = sys.toSim(x0 + (x1 - x0) * (i / frames), y0 + (y1 - y0) * (i / frames), rect);
              q = p ? { x, y, vx: x - p.x, vy: y - p.y } : { x, y, vx: 0, vy: 0 };
              p = q;
            }
            const a = performance.now();
            sys.simulate(0, 0, 0, 0, q);
            cost += performance.now() - a;
          }
          const off = sys.phys.off;
          let moved = 0, glowing = 0, maxOff = 0;
          for (let i = 0; i < sys.n; i += 1) {
            const m = Math.hypot(off[i * 3], off[i * 3 + 1]);
            if (m > 0.01) moved += 1;
            if (off[i * 3 + 2] > 0.3) glowing += 1;
            if (m > maxOff) maxOff = m;
          }
          sys.render(0, 0, 0, 0, 1);
          const g = sys.gl, w = g.drawingBufferWidth, h = g.drawingBufferHeight;
          const px = new Uint8Array(w * h * 4);
          g.readPixels(0, 0, w, h, g.RGBA, g.UNSIGNED_BYTE, px);
          let lit = 0, bright = 0;
          for (let i = 0; i < px.length; i += 4) {
            if (px[i + 3] > 20) { lit += 1; if (px[i] > 150 && px[i + 1] > 170) bright += 1; }
          }
          return { stepMs: +(cost / (frames + settle + 1)).toFixed(3), moved, glowing, maxOff: +maxOff.toFixed(3), awake: sys.phys.awake, lit, bright };
        };
        window.__particleCount = sys.n;
      }
    }).catch(() => { /* no particles; the landscape still renders */ });

    canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); cancelAnimationFrame(raf); sys = null; });
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", away, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", away);
      window.removeEventListener("resize", onResize);
      if (sys) sys.destroy();
    };
  }, [mobile, reduced, morphRef, visibleRef]);

  return <canvas ref={ref} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", pointerEvents: "none" }} />;
}
