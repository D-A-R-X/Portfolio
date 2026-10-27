import { useEffect, useRef } from "react";
import { T, PARTICLE } from "./theme.js";

/* ─────────────────────────────────────────────────────────
   THE WORLD — a pinned scene the opening chapters scroll over.

   Two parts:
   1. A particle field in raw WebGL (no library). Every particle
      carries its position in five shapes as vertex attributes;
      the vertex shader blends between them, so morphing ~9,000
      particles costs the CPU a few uniform writes a frame. The
      pointer adds real physics on top (see createPhysics).
   2. A quiet ground: a sky wash, one soft light and a single
      horizon hairline, moved at different depths as you scroll.
      Transform-only.
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

/* Shapes are sampled from a drawing rather than described by maths: each
   builder paints a silhouette on a small offscreen canvas, and the sampler
   scatters particles across the pixels it covers. Anything that can be drawn
   can be a shape, so the sequence can say something — the monogram, the three
   things I build, and the studio — instead of being geometry for its own sake. */

const S = 260;           // sampling canvas, px
const FIELD_DEPTH = 7.0; // how far the field runs before it wraps
const DEPTH = 0.3;       // z spread given to a flat drawing

function sample(draw, n, seed, { depth = DEPTH, height = 2.3, w = S, h = S } = {}) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const x = c.getContext("2d", { willReadFrequently: true });
  x.fillStyle = "#000";
  x.strokeStyle = "#000";
  x.lineJoin = "round";
  x.lineCap = "round";
  draw(x);

  const data = x.getImageData(0, 0, w, h).data;
  const px = [];
  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (let y = 0; y < h; y += 2) {
    for (let xx = 0; xx < w; xx += 2) {
      if (data[(y * w + xx) * 4 + 3] > 140) {
        px.push(xx, y);
        if (xx < minX) minX = xx; if (xx > maxX) maxX = xx;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  const k = px.length / 2;
  const out = new Float32Array(n * 3);
  const r = rng(seed);
  if (!k) return out;

  // every shape is normalised to the same height, so the stage never jumps
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const scale = height / Math.max(1, maxY - minY);
  for (let i = 0; i < n; i += 1) {
    const j = ((r() * k) | 0) * 2;
    out[i * 3] = (px[j] - cx) * scale + (r() - 0.5) * 0.03;
    out[i * 3 + 1] = -(px[j + 1] - cy) * scale + (r() - 0.5) * 0.03;
    out[i * 3 + 2] = (r() - 0.5) * depth;
  }
  return out;
}

function roundRect(x, a, b, w, h, r) {
  x.beginPath();
  x.moveTo(a + r, b);
  x.arcTo(a + w, b, a + w, b + h, r);
  x.arcTo(a + w, b + h, a, b + h, r);
  x.arcTo(a, b + h, a, b, r);
  x.arcTo(a, b, a + w, b, r);
  x.closePath();
}

/** The name, full width — the first thing the particles spell out. */
function wordmark(text, n, font, seed, stacked) {
  // one line is right for a landscape screen; a portrait one gets the name
  // stacked, because a single wide line would run off both edges
  const rows = stacked ? text.split(" ") : [text];
  const W = stacked ? 620 : 1100;
  const H = stacked ? 460 : 260;
  const size = stacked ? 230 : 200;
  return sample((x) => {
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.font = `360 ${size}px ${font}`;
    x.letterSpacing = stacked ? "10px" : "14px";
    x.lineWidth = 3;
    const step = size * 0.92;
    const top = H / 2 - (step * (rows.length - 1)) / 2;
    rows.forEach((row, i) => {
      // the stencil face is slim; a light stroke gives the particles a body
      x.fillText(row, W / 2, top + i * step);
      x.strokeText(row, W / 2, top + i * step);
    });
  }, n, seed, { depth: 0.2, height: stacked ? 1.5 : 0.78, w: W, h: H });
}

/** The monogram — Cruza at the studio chapter. */
function glyph(char, n, font, seed) {
  return sample((x) => {
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.font = `italic 210px ${font}`;
    // Instrument Serif has hairline strokes; sampled as-is the monogram reads
    // as a faint outline. Stroking it first gives the particles a body to fill.
    x.lineWidth = 11;
    x.strokeText(char, S / 2, S / 2 + 10);
    x.fillText(char, S / 2, S / 2 + 10);
  }, n, seed, { depth: 0.36 });
}

/** A phone — the Android work. */
function phone(n, seed) {
  return sample((x) => {
    x.lineWidth = 9;
    roundRect(x, 78, 16, 104, 228, 22);
    x.stroke();
    x.lineWidth = 5;
    x.beginPath();                       // earpiece
    x.moveTo(116, 34); x.lineTo(144, 34);
    x.stroke();
    x.lineWidth = 7;                     // content: a card and three rows
    roundRect(x, 96, 56, 68, 40, 7);
    x.stroke();
    x.lineWidth = 8;
    for (let i = 0; i < 3; i += 1) {
      const y = 116 + i * 26;
      x.beginPath();
      x.moveTo(96, y); x.lineTo(i === 2 ? 138 : 164, y);
      x.stroke();
    }
    x.lineWidth = 6;                     // home indicator
    x.beginPath();
    x.moveTo(108, 228); x.lineTo(152, 228);
    x.stroke();
  }, n, seed, { depth: 0.22 });
}

/** A browser window with its brackets — the web platforms. */
function browser(n, seed) {
  return sample((x) => {
    x.lineWidth = 9;
    roundRect(x, 20, 52, 220, 156, 16);
    x.stroke();
    x.lineWidth = 7;                     // title bar
    x.beginPath();
    x.moveTo(20, 86); x.lineTo(240, 86);
    x.stroke();
    for (let i = 0; i < 3; i += 1) {     // traffic lights
      x.beginPath();
      x.arc(40 + i * 20, 69, 5.5, 0, Math.PI * 2);
      x.fill();
    }
    x.lineWidth = 11;                    // < / >
    x.beginPath();
    x.moveTo(96, 120); x.lineTo(74, 147); x.lineTo(96, 174);
    x.moveTo(164, 120); x.lineTo(186, 147); x.lineTo(164, 174);
    x.moveTo(140, 114); x.lineTo(120, 180);
    x.stroke();
  }, n, seed, { depth: 0.26 });
}

/** Stacked drums — the databases and services underneath. */
function server(n, seed) {
  return sample((x) => {
    const cx = 130, rx = 68, ry = 20;
    x.lineWidth = 9;
    for (let i = 0; i < 3; i += 1) {
      const top = 54 + i * 60;
      x.beginPath();                     // drum lid
      x.ellipse(cx, top, rx, ry, 0, 0, Math.PI * 2);
      x.stroke();
      x.beginPath();                     // its walls
      x.moveTo(cx - rx, top); x.lineTo(cx - rx, top + 34);
      x.moveTo(cx + rx, top); x.lineTo(cx + rx, top + 34);
      x.stroke();
      x.beginPath();                     // the front edge of the base
      x.ellipse(cx, top + 34, rx, ry, 0, 0, Math.PI);
      x.stroke();
      x.lineWidth = 7;                   // status light
      x.beginPath();
      x.arc(cx + 34, top + 12, 4.5, 0, Math.PI * 2);
      x.fill();
      x.lineWidth = 9;
    }
  }, n, seed, { depth: 0.3 });
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
uniform vec3 uDeep, uMid, uLite, uHot;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c);
  if (d > 0.25) discard;
  vec3 col = vT < 0.5 ? mix(uDeep, uMid, vT * 2.0) : mix(uMid, uLite, (vT - 0.5) * 2.0);
  if (vT > 0.94) col = uHot;

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

/* ─── the field ───────────────────────────────────────────
   A cloud of motes the camera travels through as you read. Each
   mote keeps a fixed position; the camera's z is what moves, and
   the modulo wraps a mote that has passed behind you to the far
   end, so an endless flight costs one buffer and one draw. */

const FIELD_VERT = `
attribute vec3 aP;
attribute vec2 aS;       // x size, y tone
uniform float uZ, uAspect, uDpr, uFade;
varying float vA, vT;
void main() {
  float z = mod(aP.z - uZ, ${FIELD_DEPTH.toFixed(1)});
  float d = 0.45 + z;
  vec2 proj = aP.xy * (1.7 / d);
  proj.x /= uAspect;
  gl_Position = vec4(proj, 0.0, 1.0);
  gl_PointSize = aS.x * uDpr * (2.6 / d);
  // fade in from the far plane, and out as it sweeps past the camera
  vA = smoothstep(${FIELD_DEPTH.toFixed(1)}, ${(FIELD_DEPTH * 0.55).toFixed(1)}, z) * smoothstep(0.0, 1.1, z) * uFade;
  vT = aS.y;
}`;

const FIELD_FRAG = `
precision mediump float;
varying float vA, vT;
uniform vec3 uMid, uLite;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c);
  if (d > 0.25) discard;
  float a = (1.0 - smoothstep(0.02, 0.25, d)) * vA * 0.5;
  gl_FragColor = vec4(mix(uMid, uLite, vT), a);
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
  let stencil = "'Arial Narrow', sans-serif";
  try {
    if (document.fonts) {
      await Promise.race([
        document.fonts.load("italic 210px 'Instrument Serif'"),
        new Promise((r) => setTimeout(r, 1500)),
      ]);
      if (document.fonts.check("italic 210px 'Instrument Serif'")) font = "'Instrument Serif', Georgia, serif";
      await Promise.race([
        document.fonts.load("360 200px 'Big Shoulders Stencil Variable'"),
        new Promise((r) => setTimeout(r, 1200)),
      ]);
      if (document.fonts.check("360 200px 'Big Shoulders Stencil Variable'")) {
        stencil = "'Big Shoulders Stencil Variable', 'Arial Narrow', sans-serif";
      }
    }
  } catch { /* fall back to Georgia */ }

  const shapes = [wordmark("SURYA J", n, stencil, 11, mobile), phone(n, 23), browser(n, 37), server(n, 41), glyph("C", n, font, 53)];

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

  const attrs = [];
  const bind = (name, data, size, usage = gl.STATIC_DRAW) => {
    const loc = gl.getAttribLocation(prog, name);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    attrs.push({ buf, loc, size });
    return buf;
  };
  const buffers = ["aA", "aB", "aC", "aD", "aE"].map((a, i) => bind(a, shapes[i], 3));
  buffers.push(bind("aR", rnd, 4));
  const phys = createPhysics(n, shapes, rnd);
  const offBuf = bind("aOff", phys.off, 3, gl.DYNAMIC_DRAW);
  buffers.push(offBuf);

  // the field's own program, buffer and uniforms
  const fProg = gl.createProgram();
  gl.attachShader(fProg, compile(gl, gl.VERTEX_SHADER, FIELD_VERT));
  gl.attachShader(fProg, compile(gl, gl.FRAGMENT_SHADER, FIELD_FRAG));
  gl.linkProgram(fProg);
  const fieldOk = gl.getProgramParameter(fProg, gl.LINK_STATUS);
  const fieldN = mobile ? 260 : 700;
  let fieldBufs = [];
  const FU = {};
  if (fieldOk) {
    gl.useProgram(fProg);
    const fr = rng(707);
    const pos = new Float32Array(fieldN * 3);
    const siz = new Float32Array(fieldN * 2);
    for (let i = 0; i < fieldN; i += 1) {
      // pushed away from dead centre so the motes frame the subject
      const a = fr() * Math.PI * 2;
      const rad = 0.5 + fr() * 2.4;
      pos[i * 3] = Math.cos(a) * rad;
      pos[i * 3 + 1] = Math.sin(a) * rad * 0.8;
      pos[i * 3 + 2] = fr() * FIELD_DEPTH;
      siz[i * 2] = 1.1 + fr() * fr() * 3.4;
      siz[i * 2 + 1] = fr();
    }
    const fbind = (name, data, size) => {
      const loc = gl.getAttribLocation(fProg, name);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      return { buf, loc };
    };
    fieldBufs = [fbind("aP", pos, 3), fbind("aS", siz, 2)];
    for (const u of ["uZ", "uAspect", "uDpr", "uFade", "uMid", "uLite"]) FU[u] = gl.getUniformLocation(fProg, u);
    gl.useProgram(prog);
  }

  const U = {};
  for (const u of ["uMorph", "uTime", "uAspect", "uDpr", "uSize", "uScale", "uTilt", "uOffset", "uFade", "uDeep", "uMid", "uLite", "uHot"]) {
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
    // chapter one is the name, which owns the middle of the screen; by the
    // second chapter the subject has moved aside to make room for the copy
    const aside = Math.min(1, Math.max(0, morph));
    const lerp = (a, b) => a + (b - a) * aside;
    return {
      morph, time, tx, ty, aspect, small,
      scale: lerp(small ? 0.55 : 0.86, small ? 0.5 : 0.58),
      ox: lerp(0, small ? 0.08 : 0.34),
      oy: lerp(small ? 0.42 : 0.56, small ? 0.44 : 0.12),
    };
  };

  /** Advances the physics; `ptr` is in aspect-corrected clip space. */
  const simulate = (morph, time, tx, ty, ptr) => {
    if (phys.step(view(morph, time, tx, ty), ptr)) {
      gl.bindBuffer(gl.ARRAY_BUFFER, offBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, phys.off);
    }
  };

  let ramp = PARTICLE.light;
  const setTheme = (t) => { ramp = PARTICLE[t] || PARTICLE.light; };

  const render = (morph, time, tx, ty, fade) => {
    const v = view(morph, time, tx, ty);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // the field first, so the shape reads in front of it
    if (fieldOk) {
      gl.useProgram(fProg);
      for (const b of fieldBufs) {
        gl.bindBuffer(gl.ARRAY_BUFFER, b.buf);
        gl.enableVertexAttribArray(b.loc);
        gl.vertexAttribPointer(b.loc, b.loc === fieldBufs[0].loc ? 3 : 2, gl.FLOAT, false, 0, 0);
      }
      // reading advances the camera; a slow drift keeps it alive when still
      gl.uniform1f(FU.uZ, morph * 1.45 + time * 0.08);
      gl.uniform1f(FU.uAspect, v.aspect);
      gl.uniform1f(FU.uDpr, dpr);
      gl.uniform1f(FU.uFade, fade);
      gl.uniform3fv(FU.uMid, ramp.mid);
      gl.uniform3fv(FU.uLite, ramp.lite);
      gl.drawArrays(gl.POINTS, 0, fieldN);

      gl.useProgram(prog);
      for (const b of attrs) {
        gl.bindBuffer(gl.ARRAY_BUFFER, b.buf);
        gl.enableVertexAttribArray(b.loc);
        gl.vertexAttribPointer(b.loc, b.size, gl.FLOAT, false, 0, 0);
      }
    }

    gl.uniform1f(U.uMorph, morph);
    gl.uniform1f(U.uTime, time);
    gl.uniform1f(U.uAspect, v.aspect);
    gl.uniform1f(U.uDpr, dpr);
    gl.uniform1f(U.uSize, v.small ? 2.6 : 3.1);
    gl.uniform1f(U.uScale, v.scale);
    gl.uniform2f(U.uTilt, tx, ty);
    gl.uniform2f(U.uOffset, v.ox, v.oy);
    gl.uniform1f(U.uFade, v.small ? fade * 0.6 : fade);
    gl.uniform3fv(U.uDeep, ramp.deep);
    gl.uniform3fv(U.uMid, ramp.mid);
    gl.uniform3fv(U.uLite, ramp.lite);
    gl.uniform3fv(U.uHot, ramp.hot);
    gl.drawArrays(gl.POINTS, 0, n);
  };

  /** Pointer position in the space the physics works in. */
  const toSim = (clientX, clientY, rect) => {
    const aspect = w / h;
    return [(((clientX - rect.left) / rect.width) * 2 - 1) * aspect, 1 - ((clientY - rect.top) / rect.height) * 2];
  };

  const destroy = () => {
    buffers.forEach((b) => gl.deleteBuffer(b));
    fieldBufs.forEach((b) => gl.deleteBuffer(b.buf));
    gl.deleteProgram(prog);
    if (fieldOk) gl.deleteProgram(fProg);
  };

  resize();
  return { gl, n, resize, render, simulate, toSim, phys, setTheme, destroy };
}

/* ─── landscape ──────────────────────────────────────────── */


export function Landscape({ layers }) {
  const L = (i) => (el) => { layers.current[i] = el; };
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: `linear-gradient(180deg, ${T.sky0} 0%, ${T.sky1} 46%, ${T.sky2} 78%, ${T.sky3} 100%)`,
        transition: "background .6s ease",
      }}
    >
      {/* one soft light behind the subject, and nothing else */}
      <div
        ref={L(0)}
        style={{
          position: "absolute", left: "50%", top: "22%",
          width: "78vmax", height: "78vmax", marginLeft: "-39vmax",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${T.glow} 0%, transparent 62%)`,
        }}
      />
      {/* a single horizon, drawn as a hairline rather than a picture */}
      <div
        ref={L(1)}
        style={{
          position: "absolute", left: 0, right: 0, bottom: "26%",
          height: 1, background: `linear-gradient(90deg, transparent, ${T.line2}, transparent)`,
          opacity: 0.8,
        }}
      />
      <div
        ref={L(2)}
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: "26%",
          background: `linear-gradient(180deg, transparent, ${T.sky3})`,
        }}
      />
    </div>
  );
}

/**
 * The particle canvas. `morphRef.current` is the target morph (0..4), set by
 * the scroll scrubber; the loop eases toward it so scrolling feels weighted.
 */
export function Particles({ morphRef, mobile, reduced, visibleRef, theme }) {
  const ref = useRef(null);
  const sysRef = useRef(null);

  // the palette can change under a running scene; re-render one frame for it
  useEffect(() => {
    const s = sysRef.current;
    if (!s) return;
    s.setTheme(theme);
    if (reduced) s.render(0, 0, 0, 0, 1);
  }, [theme, reduced]);

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
      sysRef.current = s;
      s.setTheme(theme);
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
        // renders one morph and returns its silhouette as an occupancy grid,
        // so a shape can be checked for being the thing it claims to be
        window.__shapeGrid = (morph, cols = 30, rows = 22) => {
          sys.render(morph, 0, 0, 0, 1);
          const g = sys.gl, w = g.drawingBufferWidth, h = g.drawingBufferHeight;
          const px = new Uint8Array(w * h * 4);
          g.readPixels(0, 0, w, h, g.RGBA, g.UNSIGNED_BYTE, px);
          let x0 = w, x1 = 0, y0 = h, y1 = 0;
          for (let y = 0; y < h; y += 1) {
            for (let x = 0; x < w; x += 1) {
              if (px[(y * w + x) * 4 + 3] > 24) {
                if (x < x0) x0 = x; if (x > x1) x1 = x;
                if (y < y0) y0 = y; if (y > y1) y1 = y;
              }
            }
          }
          if (x1 < x0) return "empty";
          const cw = (x1 - x0 + 1) / cols, ch = (y1 - y0 + 1) / rows;
          const lines = [];
          for (let r = rows - 1; r >= 0; r -= 1) {
            let line = "";
            for (let cI = 0; cI < cols; cI += 1) {
              let hit = 0;
              for (let y = Math.floor(y0 + r * ch); y < y0 + (r + 1) * ch && y < h; y += 2) {
                for (let x = Math.floor(x0 + cI * cw); x < x0 + (cI + 1) * cw && x < w; x += 2) {
                  if (px[(y * w + x) * 4 + 3] > 24) hit += 1;
                }
              }
              line += hit > 6 ? "#" : hit > 1 ? "+" : ".";
            }
            lines.push(line);
          }
          return lines.join(String.fromCharCode(10));
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
      sysRef.current = null;
    };
  }, [mobile, reduced, morphRef, visibleRef]);

  return <canvas ref={ref} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", pointerEvents: "none" }} />;
}
