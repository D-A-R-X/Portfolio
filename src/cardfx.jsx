import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────
   CARD FX — project art that behaves like liquid glass.

   Hover: the art ripples around the pointer, splits into RGB
   fringes, zooms a touch and the card's edge bulges toward the
   cursor. Fast scroll: the cards bend with the scroll and, when
   it is really moving, glitch into shifted pixel bands.

   How it stays cheap and locked to the page:
   - One WebGL canvas lives inside the projects grid, covering
     only the stretch of it that is on screen (it hops along in
     steps as you scroll). Being in the page flow, it scrolls
     natively with the cards, so the art never slips behind its
     caption the way a fixed overlay would.
   - Each animating card is drawn straight into its own region
     of that canvas: no copies between canvases.
   - At rest you see the card's own DOM art and the canvas is
     hidden; a card hands over to the canvas only while it is
     animating, and the loop sleeps when nothing is.
   - Art is rasterised once per card, lazily, from its SVG.
   ───────────────────────────────────────────────────────── */

const MARGIN = 18;      // css px of room around each card for the edge to bulge
const RADIUS = 18;      // matches .pcard-art
const BUFFER = 260;     // css px the layer extends past the viewport, each side
const HOP = 120;        // the layer moves in steps this size
const DPR_CAP = 1.25;

const VS = `
attribute vec2 aPos;
varying vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FS = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uSize;       // canvas px (incl. margin)
uniform float uMargin, uRadius;
uniform vec2 uMouse;      // card uv, y up
uniform float uHover;     // 0..1
uniform float uBend;      // signed scroll velocity, ~-1..1
uniform float uGlitch;    // 0..1
uniform float uTime;
uniform vec3 uBorder;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
  vec2 card = uSize - 2.0 * uMargin;
  vec2 p = vUv * uSize - uMargin;          // card px, y up
  vec2 uv = p / card;
  float aspect = card.x / card.y;

  // scroll bends the card like a sheet; the middle leads the edges
  float bend = uBend * sin(uv.x * 3.14159);
  p.y -= bend * uMargin * 0.8;
  uv.y -= bend * uMargin * 0.8 / card.y;

  // pointer field
  vec2 dm = (uv - uMouse) * vec2(aspect, 1.0);
  float near = exp(-dot(dm, dm) / 0.09);

  // edge: rounded rect whose outline breathes and bulges toward the pointer
  vec2 q = abs(p - card * 0.5) - (card * 0.5 - uRadius);
  float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
  float wob = noise(p * 0.012 + uTime * 0.6) - 0.5;
  float edgeNear = exp(-dot(dm, dm) / 0.25);
  sd -= uHover * (edgeNear * uMargin * 0.7 + wob * 7.0);
  sd -= abs(uBend) * wob * 10.0;
  float alpha = 1.0 - smoothstep(-0.75, 0.75, sd);
  if (alpha <= 0.0) { gl_FragColor = vec4(0.0); return; }

  // liquid: streaky flow, strongest under the pointer
  float t = uTime * 0.8;
  vec2 flow = vec2(noise(vec2(uv.y * 7.0, t)) - 0.5, noise(vec2(uv.x * 4.0 + 9.0, t * 0.7)) - 0.5);
  flow += 0.5 * (vec2(noise(uv * 11.0 + t), noise(uv * 11.0 - t + 5.0)) - 0.5);
  vec2 disp = flow * uHover * near * 0.16;
  disp += normalize(dm + 1e-4) * uHover * near * 0.025 / vec2(aspect, 1.0);

  // hover zoom
  uv = (uv - 0.5) / (1.0 + 0.045 * uHover) + 0.5;

  // glitch: bands of the image jump sideways and pixelate
  if (uGlitch > 0.001) {
    float band = floor(uv.y * 18.0);
    float seed = floor(uTime * 24.0);
    float h = hash(vec2(band, seed));
    if (h < uGlitch * 0.55) {
      uv.x += (hash(vec2(seed, band)) - 0.5) * 0.12 * uGlitch;
      vec2 blocks = vec2(46.0, 34.0) * (1.0 - 0.6 * uGlitch) + 4.0;
      uv = (floor(uv * blocks) + 0.5) / blocks;
    }
  }

  // RGB split: channels ride the distortion at different strengths
  vec2 dir = normalize(disp + vec2(0.0001, 0.0)) ;
  float ca = uHover * near * 0.018 + abs(uBend) * 0.012 + uGlitch * 0.02;
  vec2 c = clamp(uv + disp, 0.0, 1.0);
  float r = texture2D(uTex, clamp(uv + disp * 1.25 + dir * ca, 0.0, 1.0)).r;
  float g = texture2D(uTex, c).g;
  float b = texture2D(uTex, clamp(uv + disp * 0.75 - dir * ca, 0.0, 1.0)).b;
  vec3 col = vec3(r, g, b);

  // hairline border, as on the DOM card
  float line = 1.0 - smoothstep(0.0, 1.2, abs(sd + 0.6));
  col = mix(col, uBorder, line * 0.9);

  gl_FragColor = vec4(col * alpha, alpha);
}`;

const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function rasterise(art) {
  const mock = art.querySelector("svg");
  const box = mock && mock.parentElement;
  if (!box) return Promise.resolve(null);
  const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
  const W = art.offsetWidth, H = art.offsetHeight;
  // layout sizes and centres, so hover zooms and reveal scales (both about the
  // centre) don't leak into the capture
  const ar = art.getBoundingClientRect(), br = box.getBoundingClientRect();
  const bw = box.offsetWidth, bh = box.offsetHeight;
  const cx = (br.left + br.width / 2 - ar.left) * (W / ar.width);
  const cy = (br.top + br.height / 2 - ar.top) * (H / ar.height);

  const clone = mock.cloneNode(true);
  clone.setAttribute("width", bw);
  clone.setAttribute("height", bh);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" }));
  const img = new Image();
  img.src = url;
  return img.decode().then(() => {
    const c = document.createElement("canvas");
    c.width = Math.round(W * dpr);
    c.height = Math.round(H * dpr);
    const x = c.getContext("2d");
    x.fillStyle = "#ffffff";
    x.fillRect(0, 0, c.width, c.height);
    x.drawImage(img, (cx - bw / 2) * dpr, (cy - bh / 2) * dpr, bw * dpr, bh * dpr);
    URL.revokeObjectURL(url);
    return c;
  }).catch(() => { URL.revokeObjectURL(url); return null; });
}

/* ─── the layer: one canvas + context per grid ───────────── */

const layers = new Set();
const byGrid = new WeakMap();

function createLayer(grid, cv) {
  let gl = null, u = null;
  try {
    gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    if (gl) {
      const sh = (t, src) => {
        const s = gl.createShader(t);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "cardfx");
        return s;
      };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.bindAttribLocation(prog, 0, "aPos");
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("cardfx link");
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      // premultiplied "over", so neighbouring cards' margins never erase each other
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
      u = {};
      for (const k of ["uTex", "uSize", "uMargin", "uRadius", "uMouse", "uHover", "uBend", "uGlitch", "uTime", "uBorder"]) u[k] = gl.getUniformLocation(prog, k);
      gl.uniform1i(u.uTex, 0);
    }
  } catch {
    gl = null;
  }

  const layer = {
    ok: !!gl, gl, grid, cards: new Set(),
    top: null, dpr: 1, w: 0, h: 0, shown: false,
    size() {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const cssW = grid.offsetWidth + MARGIN * 2;
      const cssH = window.innerHeight + BUFFER * 2;
      const w = Math.round(cssW * dpr), h = Math.round(cssH * dpr);
      if (w !== layer.w || h !== layer.h) {
        cv.width = w; cv.height = h;
        cv.style.width = `${cssW}px`;
        cv.style.height = `${cssH}px`;
        layer.w = w; layer.h = h; layer.dpr = dpr;
      }
    },
    hide() {
      if (!layer.shown) return;
      layer.shown = false;
      gl.clear(gl.COLOR_BUFFER_BIT);
      cv.style.visibility = "hidden";
    },
    /** Draws every card that wants drawing. Returns the ones it drew. */
    draw(list, time) {
      const g = grid.getBoundingClientRect();
      // the viewport, in grid coordinates, is [-g.top, -g.top + innerHeight]
      const top = Math.floor((-g.top - BUFFER) / HOP) * HOP;
      if (top !== layer.top) {
        layer.top = top;
        cv.style.transform = `translate3d(0,${top}px,0)`;
      }
      gl.viewport(0, 0, layer.w, layer.h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const d = layer.dpr;
      for (const c of list) {
        const r = c.art.getBoundingClientRect();
        const x = r.left - g.left;                    // layer x 0 = grid left - MARGIN
        const y = r.top - g.top - top;                // card top - MARGIN, in layer px
        const w = Math.round((r.width + MARGIN * 2) * d), h = Math.round((r.height + MARGIN * 2) * d);
        const px = Math.round(x * d), py = Math.round(y * d);
        if (py > layer.h || py + h < 0) continue;
        gl.viewport(px, layer.h - py - h, w, h);
        c.shade(gl, u, w, h, d, time);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      if (!layer.shown) { layer.shown = true; cv.style.visibility = "visible"; }
    },
    destroy() {
      layers.delete(layer);
      byGrid.delete(grid);
      const lose = gl && gl.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
    },
  };
  cv.addEventListener("webglcontextlost", (e) => { e.preventDefault(); layer.ok = false; layer.cards.forEach((c) => c.off()); });
  layer.size();
  layers.add(layer);
  byGrid.set(grid, layer);
  return layer;
}

function layerFor(grid) {
  if (!grid) return null;
  if (byGrid.has(grid)) return byGrid.get(grid);
  const cv = grid.querySelector(":scope > .fx-layer");
  return cv ? createLayer(grid, cv) : null;
}

/* ─── the loop ───────────────────────────────────────────── */

let running = false, lastY = 0, vel = 0, t0 = 0;

function frame(now) {
  const y = window.scrollY;
  // px per frame, smoothed; cards bend with it and glitch when it's fast
  vel += ((y - lastY) - vel) * 0.25;
  lastY = y;
  const time = (now - t0) / 1000;
  let busy = Math.abs(vel) > 0.3;
  for (const layer of layers) {
    if (!layer.ok) continue;
    const draw = [];
    for (const c of layer.cards) {
      const s = c.tick(vel);
      if (s) busy = true;
      if (s === 2) draw.push(c);
    }
    if (draw.length) layer.draw(draw, time);
    else layer.hide();
    // cards flip to their canvas only once they have been drawn this frame
    for (const c of layer.cards) c.sync(draw.includes(c));
  }
  if (busy) requestAnimationFrame(frame);
  else { running = false; vel = 0; }
}

function wake() {
  if (running || reduced) return;
  running = true;
  if (!t0) t0 = performance.now();
  lastY = window.scrollY;
  requestAnimationFrame(frame);
}

if (typeof window !== "undefined") window.addEventListener("scroll", () => { if (layers.size) wake(); }, { passive: true });

/* ─── one card ───────────────────────────────────────────── */

function mountCard(layer, wrap, art, fine) {
  const gl = layer.gl;
  const st = {
    tex: null, loading: false, ready: false, inView: false, on: false,
    hover: 0, hoverTo: 0, mx: 0.5, my: 0.5, tmx: 0.5, tmy: 0.5,
    bend: 0, glitch: 0,
  };

  // the card's reveal (wipe + scale) must have finished before we stand in for it
  const settled = () => {
    if (st.ready) return true;
    const rv = wrap.closest(".rv");
    if (rv && !rv.classList.contains("in")) return false;
    const wa = art.querySelector(".wipe-art");
    const tf = wa ? getComputedStyle(wa).transform : "none";
    if (tf !== "none" && tf !== "matrix(1, 0, 0, 1, 0, 0)") return false;
    st.ready = true;
    return true;
  };

  const load = () => {
    if (!layer.ok || st.tex || st.loading) return undefined;
    if (!settled()) { if (st.inView) setTimeout(load, 700); return undefined; }
    st.loading = true;
    return rasterise(art).then((img) => {
      st.loading = false;
      if (!img || !layer.ok) return;
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      st.tex = tex;
      wrap.classList.add("ok");
      if (st.hoverTo) wake();
    });
  };

  const card = {
    art,
    off() {
      st.on = false;
      wrap.classList.remove("on");
    },
    // 0: idle · 1: animating but off screen · 2: draw me
    tick(v) {
      if (!st.tex) return 0;
      st.hover += (st.hoverTo - st.hover) * (st.hoverTo ? 0.09 : 0.07);
      st.mx += (st.tmx - st.mx) * 0.2;
      st.my += (st.tmy - st.my) * 0.2;
      const bendTo = st.inView ? Math.max(-1, Math.min(1, v / 45)) : 0;
      st.bend += (bendTo - st.bend) * 0.2;
      const gTo = st.inView ? Math.min(1, Math.max(0, (Math.abs(v) - 28) / 50)) : 0;
      st.glitch += (gTo - st.glitch) * 0.3;
      const live = st.hover > 0.002 || Math.abs(st.bend) > 0.004 || st.glitch > 0.004 || st.hoverTo > 0;
      if (!live) { st.hover = 0; st.bend = 0; st.glitch = 0; return 0; }
      return st.inView ? 2 : 1;
    },
    sync(drawn) {
      if (drawn && !st.on) { st.on = true; wrap.classList.add("on"); }
      else if (!drawn && st.on) card.off();
    },
    shade(g, u, w, h, d, time) {
      g.bindTexture(g.TEXTURE_2D, st.tex);
      g.uniform2f(u.uSize, w, h);
      g.uniform1f(u.uMargin, MARGIN * d);
      g.uniform1f(u.uRadius, RADIUS * d);
      g.uniform2f(u.uMouse, st.mx, st.my);
      g.uniform1f(u.uHover, st.hover);
      g.uniform1f(u.uBend, st.bend);
      g.uniform1f(u.uGlitch, st.glitch);
      g.uniform1f(u.uTime, time);
      // #e5e8ef at rest, ice blue on hover — the DOM card's border
      const k = st.hover;
      g.uniform3f(u.uBorder, 0.898 - 0.133 * k, 0.91 - 0.086 * k, 0.937 + 0.032 * k);
    },
    // ?perf: load, set a state, draw one frame synchronously, read it back
    async probe({ hover = 0, mx = 0.5, my = 0.5, bend = 0, glitch = 0 } = {}) {
      st.ready = true;
      st.inView = true;
      if (!st.tex) await load();
      if (!st.tex) return { error: "no texture" };
      Object.assign(st, { hover, mx, my, bend, glitch });
      layer.size();
      const a = performance.now();
      layer.draw([card], 1.3);
      gl.finish();
      const ms = performance.now() - a;
      // read this card's region back
      const g = layer.grid.getBoundingClientRect(), r = art.getBoundingClientRect(), dd = layer.dpr;
      const w = Math.round((r.width + MARGIN * 2) * dd), h = Math.round((r.height + MARGIN * 2) * dd);
      const px = Math.round((r.left - g.left) * dd), py = Math.round((r.top - g.top - layer.top) * dd);
      const buf = new Uint8Array(w * h * 4);
      gl.readPixels(px, layer.h - py - h, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buf);
      let lit = 0, bulge = 0, fringe = 0;
      const m = Math.round(MARGIN * dd);
      for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
          const i = (y * w + x) * 4;
          if (buf[i + 3] < 30) continue;
          lit += 1;
          if (x < m - 2 || y < m - 2 || x > w - m + 2 || y > h - m + 2) bulge += 1;
          const R = buf[i], G = buf[i + 1], B = buf[i + 2];
          if (Math.max(R, G, B) - Math.min(R, G, B) > 60 && R > B) fringe += 1;
        }
      }
      st.hover = 0; st.bend = 0; st.glitch = 0;
      layer.hide();
      return { ms: +ms.toFixed(2), region: [w, h], lit, bulge, fringe };
    },
  };

  const local = (e) => {
    const r = art.getBoundingClientRect();
    st.tmx = (e.clientX - r.left) / r.width;
    st.tmy = 1 - (e.clientY - r.top) / r.height;
  };
  const enter = (e) => {
    if (!fine || e.pointerType !== "mouse") return;
    local(e);
    if (!st.hover) { st.mx = st.tmx; st.my = st.tmy; }
    st.hoverTo = 1;
    load();
    wake();
  };
  const move = (e) => { if (st.hoverTo) { local(e); wake(); } };
  const leave = () => { st.hoverTo = 0; wake(); };

  const io = new IntersectionObserver(([en]) => {
    st.inView = en.isIntersecting;
    if (st.inView) setTimeout(load, 1800);
  }, { rootMargin: "120px 0px" });
  io.observe(wrap);
  // a resized card needs a fresh capture
  let firstRO = true;
  const ro = new ResizeObserver(() => {
    if (firstRO) { firstRO = false; return; }
    layer.size();
    if (st.tex) { gl.deleteTexture(st.tex); st.tex = null; wrap.classList.remove("ok"); load(); }
  });
  ro.observe(art);

  wrap.addEventListener("pointerenter", enter);
  wrap.addEventListener("pointermove", move);
  wrap.addEventListener("pointerleave", leave);
  layer.cards.add(card);
  if (new URLSearchParams(window.location.search).has("perf")) {
    (window.__cardProbe = window.__cardProbe || []).push(card.probe);
  }

  return () => {
    layer.cards.delete(card);
    io.disconnect();
    ro.disconnect();
    wrap.removeEventListener("pointerenter", enter);
    wrap.removeEventListener("pointermove", move);
    wrap.removeEventListener("pointerleave", leave);
    if (st.tex && layer.ok) gl.deleteTexture(st.tex);
  };
}

/** The grid of cards. Owns the shared canvas the cards are drawn into. */
export function FXGrid({ children, style, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const grid = ref.current;
    if (reduced || !grid) return undefined;
    const layer = layerFor(grid);
    const onResize = () => layer && layer.ok && layer.size();
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      if (layer) layer.destroy();
    };
  }, []);
  return (
    <div ref={ref} className={`fx-grid ${className}`} style={style}>
      {children}
      <canvas className="fx-layer" aria-hidden="true" />
    </div>
  );
}

/** Wraps a card's art (`.pcard-art`) so the grid's layer can stand in for it. */
export function FXArt({ children }) {
  const wrap = useRef(null);
  useEffect(() => {
    const w = wrap.current;
    const art = w && w.firstElementChild;
    if (!art || reduced) return undefined;
    const layer = layerFor(w.closest(".fx-grid"));
    if (!layer || !layer.ok) return undefined;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    return mountCard(layer, w, art, fine);
  }, []);
  return <div ref={wrap} className="fx">{children}</div>;
}

export const FX_CSS = `
  .fx-grid{position:relative}
  .fx-layer{position:absolute;left:-${MARGIN}px;top:0;pointer-events:none;z-index:2;visibility:hidden}
  .fx.on>.pcard-art{visibility:hidden}
  .fx.ok .pcard-mock{transform:none!important}
  .fx.ok .pcard-scan{display:none}
`;
