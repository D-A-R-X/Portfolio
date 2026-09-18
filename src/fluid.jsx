import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────
   SMOKE — the cursor stirs a real fluid.

   A small stable-fluids solver on the GPU: the pointer injects
   velocity and dye; each frame the velocity field is advected,
   given back its small swirls (vorticity confinement), and made
   incompressible with a pressure solve; the dye rides along and
   slowly dissipates. That is what makes it curl and billow like
   smoke instead of fading like a sprite trail.

   Cost control: the velocity grid is 128 cells on its short side,
   the dye 512; the loop only runs while the pointer has moved in
   the last few seconds, then clears the canvas and sleeps. Fine
   pointers only, never with reduced motion.
   ───────────────────────────────────────────────────────── */

const SIM_RES = 128;
const DYE_RES = 448;
const PRESSURE_ITERS = 12;
const CURL = 12;
const VEL_DISSIPATION = 1.1;
const DYE_DISSIPATION = 1.5;
const SPLAT_RADIUS = 0.0023;
const SPLAT_FORCE = 2600;
// pointer response: movement is gathered into one stroke per frame (high-rate
// mice send many events a frame), tiny jitters are ignored, and the push and
// the amount of smoke both grow with speed but level off
const DEADZONE = 0.0016;   // uv per frame, ~2px on a laptop screen
const MAX_STEP = 0.035;    // uv per frame counted as full speed
const SEG = 0.018;         // a long stroke is laid down in pieces this long
const IDLE_MS = 3200;

const VS = `
precision highp float;
attribute vec2 aPos;
uniform vec2 texel;
varying vec2 vUv, vL, vR, vT, vB;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vL = vUv - vec2(texel.x, 0.0);
  vR = vUv + vec2(texel.x, 0.0);
  vT = vUv + vec2(0.0, texel.y);
  vB = vUv - vec2(0.0, texel.y);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const HEAD = `precision highp float;
precision highp sampler2D;
varying vec2 vUv, vL, vR, vT, vB;
`;

const FS = {
  splat: HEAD + `
uniform sampler2D uTarget;
uniform float aspect, radius;
uniform vec3 color;
uniform vec2 point;
void main() {
  vec2 p = vUv - point;
  p.x *= aspect;
  vec3 s = exp(-dot(p, p) / radius) * color;
  gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + s, 1.0);
}`,
  advect: HEAD + `
uniform sampler2D uVelocity, uSource;
uniform vec2 simTexel;
uniform float dt, dissipation;
void main() {
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * simTexel;
  gl_FragColor = texture2D(uSource, coord) / (1.0 + dissipation * dt);
}`,
  divergence: HEAD + `
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x;
  if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y;
  if (vB.y < 0.0) B = -C.y;
  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`,
  curl: HEAD + `
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`,
  vorticity: HEAD + `
uniform sampler2D uVelocity, uCurl;
uniform float curl, dt;
void main() {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 f = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  f /= length(f) + 0.0001;
  f *= curl * C;
  f.y *= -1.0;
  vec2 v = texture2D(uVelocity, vUv).xy + f * dt;
  gl_FragColor = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
}`,
  pressure: HEAD + `
uniform sampler2D uPressure, uDivergence;
void main() {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float d = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((L + R + B + T - d) * 0.25, 0.0, 0.0, 1.0);
}`,
  gradient: HEAD + `
uniform sampler2D uPressure, uVelocity;
void main() {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 v = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
  gl_FragColor = vec4(v, 0.0, 1.0);
}`,
  scale: HEAD + `
uniform sampler2D uTexture;
uniform float value;
void main() { gl_FragColor = value * texture2D(uTexture, vUv); }`,
  // dye is stored as premultiplied colour; alpha is its strongest channel,
  // so thin smoke is a faint tint and dense smoke a deeper blue
  display: HEAD + `
uniform sampler2D uTexture;
void main() {
  vec3 c = texture2D(uTexture, vUv).rgb;
  float a = clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0);
  c = min(c, vec3(a));
  gl_FragColor = vec4(c, a) * 0.55;
}`,
};

function makeContext(canvas) {
  const opts = { alpha: true, depth: false, stencil: false, antialias: false, premultipliedAlpha: true, powerPreference: "low-power" };
  let gl = canvas.getContext("webgl2", opts);
  const gl2 = !!gl;
  if (!gl) gl = canvas.getContext("webgl", opts);
  if (!gl) return null;
  let type, internal;
  if (gl2) {
    if (!gl.getExtension("EXT_color_buffer_float") && !gl.getExtension("EXT_color_buffer_half_float")) return null;
    type = gl.HALF_FLOAT;
    internal = gl.RGBA16F;
  } else {
    const hf = gl.getExtension("OES_texture_half_float");
    if (!hf || !gl.getExtension("OES_texture_half_float_linear")) return null;
    type = hf.HALF_FLOAT_OES;
    internal = gl.RGBA;
  }
  return { gl, type, internal };
}

function program(gl, fs) {
  const sh = (t, src) => {
    const s = gl.createShader(t);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "fluid shader");
    return s;
  };
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(p, 0, "aPos");
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error("fluid link");
  const u = {};
  const count = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i += 1) {
    const info = gl.getActiveUniform(p, i);
    u[info.name] = gl.getUniformLocation(p, info.name);
  }
  return { p, u };
}

function createFluid(canvas) {
  const ctx = makeContext(canvas);
  if (!ctx) return null;
  const { gl, type, internal } = ctx;

  let P;
  try {
    P = Object.fromEntries(Object.entries(FS).map(([k, src]) => [k, program(gl, src)]));
  } catch {
    return null;
  }

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  const idx = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);
  gl.disable(gl.BLEND);

  const target = (w, h) => {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, gl.RGBA, type, null);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return {
      tex, fb, w, h, ok,
      tx: 1 / w, ty: 1 / h,
      use(unit) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); return unit; },
      free() { gl.deleteTexture(tex); gl.deleteFramebuffer(fb); },
    };
  };
  const pair = (w, h) => {
    let a = target(w, h), b = target(w, h);
    return {
      get read() { return a; }, get write() { return b; },
      swap() { const t = a; a = b; b = t; },
      ok: a.ok && b.ok, w, h, tx: a.tx, ty: a.ty,
      free() { a.free(); b.free(); },
    };
  };
  const res = (r) => {
    let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspect < 1) aspect = 1 / aspect;
    const big = Math.round(r * aspect), small = Math.round(r);
    return gl.drawingBufferWidth > gl.drawingBufferHeight ? [big, small] : [small, big];
  };

  let vel, dye, pres, div, curl;
  const build = () => {
    [vel, dye, pres, div, curl].forEach((t) => t && t.free());
    const [sw, sh] = res(SIM_RES);
    const [dw, dh] = res(DYE_RES);
    vel = pair(sw, sh);
    dye = pair(dw, dh);
    pres = pair(sw, sh);
    div = target(sw, sh);
    curl = target(sw, sh);
    return vel.ok && dye.ok && pres.ok && div.ok && curl.ok;
  };

  const resize = () => {
    const w = Math.max(1, Math.round(canvas.clientWidth));
    const h = Math.max(1, Math.round(canvas.clientHeight));
    if (canvas.width === w && canvas.height === h && vel) return true;
    canvas.width = w;
    canvas.height = h;
    return build();
  };
  if (!resize()) return null;

  const draw = (dest) => {
    if (dest) {
      gl.viewport(0, 0, dest.w, dest.h);
      gl.bindFramebuffer(gl.FRAMEBUFFER, dest.fb);
    } else {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  };
  const run = (prog, texel) => {
    gl.useProgram(prog.p);
    if (prog.u.texel) gl.uniform2f(prog.u.texel, texel[0], texel[1]);
    return prog.u;
  };

  const splat = (x, y, dx, dy, color) => {
    const aspect = canvas.width / canvas.height;
    const radius = SPLAT_RADIUS * (aspect > 1 ? aspect : 1);
    let u = run(P.splat, [vel.tx, vel.ty]);
    gl.uniform1i(u.uTarget, vel.read.use(0));
    gl.uniform1f(u.aspect, aspect);
    gl.uniform2f(u.point, x, y);
    gl.uniform3f(u.color, dx, dy, 0);
    gl.uniform1f(u.radius, radius);
    draw(vel.write);
    vel.swap();

    u = run(P.splat, [dye.tx, dye.ty]);
    gl.uniform1i(u.uTarget, dye.read.use(0));
    gl.uniform1f(u.aspect, aspect);
    gl.uniform2f(u.point, x, y);
    gl.uniform3f(u.color, color[0], color[1], color[2]);
    gl.uniform1f(u.radius, radius);
    draw(dye.write);
    dye.swap();
  };

  const step = (dt) => {
    const st = [vel.tx, vel.ty];
    let u = run(P.curl, st);
    gl.uniform1i(u.uVelocity, vel.read.use(0));
    draw(curl);

    u = run(P.vorticity, st);
    gl.uniform1i(u.uVelocity, vel.read.use(0));
    gl.uniform1i(u.uCurl, curl.use(1));
    gl.uniform1f(u.curl, CURL);
    gl.uniform1f(u.dt, dt);
    draw(vel.write);
    vel.swap();

    u = run(P.divergence, st);
    gl.uniform1i(u.uVelocity, vel.read.use(0));
    draw(div);

    u = run(P.scale, st);
    gl.uniform1i(u.uTexture, pres.read.use(0));
    gl.uniform1f(u.value, 0.8);
    draw(pres.write);
    pres.swap();

    u = run(P.pressure, st);
    gl.uniform1i(u.uDivergence, div.use(0));
    for (let i = 0; i < PRESSURE_ITERS; i += 1) {
      gl.uniform1i(u.uPressure, pres.read.use(1));
      draw(pres.write);
      pres.swap();
    }

    u = run(P.gradient, st);
    gl.uniform1i(u.uPressure, pres.read.use(0));
    gl.uniform1i(u.uVelocity, vel.read.use(1));
    draw(vel.write);
    vel.swap();

    u = run(P.advect, st);
    gl.uniform2f(u.simTexel, vel.tx, vel.ty);
    gl.uniform1i(u.uVelocity, vel.read.use(0));
    gl.uniform1i(u.uSource, vel.read.use(0));
    gl.uniform1f(u.dt, dt);
    gl.uniform1f(u.dissipation, VEL_DISSIPATION);
    draw(vel.write);
    vel.swap();

    u = run(P.advect, [dye.tx, dye.ty]);
    gl.uniform2f(u.simTexel, vel.tx, vel.ty);
    gl.uniform1i(u.uVelocity, vel.read.use(0));
    gl.uniform1i(u.uSource, dye.read.use(1));
    gl.uniform1f(u.dt, dt);
    gl.uniform1f(u.dissipation, DYE_DISSIPATION);
    draw(dye.write);
    dye.swap();
  };

  const render = () => {
    const u = run(P.display, [1 / canvas.width, 1 / canvas.height]);
    gl.uniform1i(u.uTexture, dye.read.use(0));
    draw(null);
  };

  const clear = () => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };

  const destroy = () => {
    [vel, dye, pres, div, curl].forEach((t) => t && t.free());
    Object.values(P).forEach(({ p }) => gl.deleteProgram(p));
    gl.deleteBuffer(quad);
    gl.deleteBuffer(idx);
  };

  // empties every field (used by the ?perf test harness)
  const reset = () => {
    for (const t of [vel.read, vel.write, dye.read, dye.write, pres.read, pres.write, div, curl]) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.fb);
      gl.viewport(0, 0, t.w, t.h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  };

  return { gl, splat, step, render, clear, reset, resize, destroy };
}

/* the page's blues, from deep to ice; each stroke picks a nearby shade */
const PALETTE = [
  [0.12, 0.31, 0.85],
  [0.2, 0.43, 0.96],
  [0.3, 0.49, 0.96],
  [0.45, 0.62, 1.0],
];

export function Smoke() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const fx = createFluid(canvas);
    if (!fx) return;

    let raf = 0, running = false, last = 0, lastMove = 0;
    let px = -1, py = -1, hue = Math.random() * PALETTE.length;
    // movement gathered since the last frame, in uv
    let gx = 0, gy = 0, sx = -1, sy = -1, pending = false;

    let amount = 1;
    const colour = () => {
      hue = (hue + 0.03) % PALETTE.length;
      const a = PALETTE[Math.floor(hue)], b = PALETTE[(Math.floor(hue) + 1) % PALETTE.length];
      const t = hue % 1;
      const k = 0.15 * amount;
      return [(a[0] + (b[0] - a[0]) * t) * k, (a[1] + (b[1] - a[1]) * t) * k, (a[2] + (b[2] - a[2]) * t) * k];
    };

    const loop = (now) => {
      if (document.hidden) { running = false; return; }
      const dt = Math.min((now - last) / 1000, 1 / 60);
      last = now;
      if (pending) { stroke(); pending = false; }
      fx.step(dt);
      fx.render();
      if (now - lastMove > IDLE_MS) {
        fx.clear();
        running = false;
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    // one stroke per frame from where the pointer was to where it is
    const stroke = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight, aspect = w / h;
      let dx = gx, dy = gy;
      if (aspect < 1) dx *= aspect; else dy /= aspect;
      const dist = Math.hypot(dx, dy);
      if (dist < DEADZONE) return;
      // full force up to MAX_STEP, then flattening out: a flick is only a
      // little stronger than a brisk move
      const speed = Math.min(1, dist / MAX_STEP);
      const gain = (speed < 1 ? 1 : MAX_STEP / dist) * (0.35 + 0.65 * speed);
      amount = 0.2 + 0.8 * speed;
      const n = Math.min(4, Math.max(1, Math.ceil(dist / SEG)));
      // the pieces overlap, so each carries a share of the push and the dye
      const share = 1 / Math.sqrt(n);
      const fx0 = dx * SPLAT_FORCE * gain * share, fy0 = dy * SPLAT_FORCE * gain * share;
      for (let i = 1; i <= n; i += 1) {
        const t = i / n;
        fx.splat(sx + gx * t, sy + gy * t, fx0, fy0, colour().map((c) => c * share));
      }
      sx += gx; sy += gy;
      gx = 0; gy = 0;
    };

    const onMove = (e) => {
      if (e.pointerType !== "mouse") return;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const x = e.clientX / w, y = 1 - e.clientY / h;
      if (px < 0) { px = x; py = y; sx = x; sy = y; gx = 0; gy = 0; return; }
      gx += x - px; gy += y - py;
      px = x; py = y;
      if (!pending && Math.abs(gx) + Math.abs(gy) < 1e-5) return;
      pending = true;
      lastMove = performance.now();
      wake();
    };
    const onLeave = (e) => { if (!e.relatedTarget) px = -1; };
    const onResize = () => { if (!fx.resize()) fx.clear(); };
    const onLost = (e) => { e.preventDefault(); cancelAnimationFrame(raf); running = false; lastMove = -1e9; };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onLeave, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    canvas.addEventListener("webglcontextlost", onLost);

    if (new URLSearchParams(window.location.search).has("perf")) {
      // times `frames` solver steps + a present, synchronously
      // feeds a scripted pointer path through a cleared fluid, one entry per
      // frame (each entry a list of [clientX, clientY] events), and reports
      // how much smoke is on screen at its peak
      window.__smokeTest = (frames, tail = 20) => {
        fx.reset();
        px = -1; pending = false; gx = 0; gy = 0;
        const g = fx.gl, w = g.drawingBufferWidth, h = g.drawingBufferHeight;
        const buf = new Uint8Array(w * h * 4);
        let peak = 0, cover = 0, max = 0;
        const W = canvas.clientWidth, H = canvas.clientHeight;
        for (let f = 0; f < frames.length + tail; f += 1) {
          for (const [cx, cy] of frames[f] || []) {
            const x = cx / W, y = 1 - cy / H;
            if (px < 0) { px = x; py = y; sx = x; sy = y; gx = 0; gy = 0; continue; }
            gx += x - px; gy += y - py; px = x; py = y; pending = true;
          }
          if (pending) { stroke(); pending = false; }
          fx.step(1 / 60);
          fx.render();
          g.readPixels(0, 0, w, h, g.RGBA, g.UNSIGNED_BYTE, buf);
          let n = 0, sum = 0, m = 0;
          for (let i = 3; i < buf.length; i += 16) { const v = buf[i]; if (v > 6) { n += 1; sum += v; if (v > m) m = v; } }
          if (sum > peak) { peak = sum; cover = n / (w * h / 4); max = m; }
        }
        fx.clear();
        px = -1;
        return { peak, coverage: +cover.toFixed(4), maxAlpha: max };
      };
      window.__smokeBench = (frames = 60) => {
        fx.splat(0.5, 0.5, 400, 200, [0.1, 0.2, 0.5]);
        const a = performance.now();
        for (let i = 0; i < frames; i += 1) { fx.step(1 / 60); fx.render(); }
        fx.gl.finish();
        return +((performance.now() - a) / frames).toFixed(3);
      };
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("webglcontextlost", onLost);
      fx.destroy();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 5, pointerEvents: "none", display: "block" }}
    />
  );
}
