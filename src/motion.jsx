import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { T, EASE } from "./theme.js";

/* ─────────────────────────────────────────────────────────
   MOTION

   Rules this file holds to, because each was measured:
   • Transforms are written onto the elements that move — never CSS
     variables on <html>, which dirties style for the whole document.
   • Layout is read on register, on resize and when the page height
     changes — never per frame.
   • One rAF loop drives every parallax layer and scrubber, and it
     sleeps as soon as nothing is settling.
   • Only transform and opacity animate. No blur, no clip-path, no
     box-shadow, no backdrop-filter.
   • A hidden state only ever applies while a reveal is pending, so no
     effect can strand content if a script never runs.
   ───────────────────────────────────────────────────────── */

// Read on the first render. Defaulting these to false made every phone paint
// the desktop layout first and jump a frame later.
const match = (q) => typeof window !== "undefined" && window.matchMedia(q).matches;

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => match("(prefers-reduced-motion: reduce)"));
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReduced(mq.matches);
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  return reduced;
}

export function useIsMobile(breakpoint = 900) {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < breakpoint);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return mobile;
}

/* ─── ENGINE ─────────────────────────────────────────────── */

const layers = new Set();
const scrubs = new Set();
let running = false;
let lastInput = 0;
let px = 0, py = 0, tpx = 0, tpy = 0;
let bound = false;

/** Strip controller transforms, read every rect, restore — one layout. */
function measureAll() {
  const ls = [...layers];
  const saved = ls.map((L) => L.el.style.transform);
  for (const L of ls) L.el.style.transform = "none";
  const sy = window.scrollY;
  const lr = ls.map((L) => L.el.getBoundingClientRect());
  const sr = [...scrubs].map((S) => [S, S.el.getBoundingClientRect()]);
  ls.forEach((L, i) => {
    L.cy = lr[i].top + sy + lr[i].height / 2;
    L.el.style.transform = saved[i];
    L.last = "";
  });
  for (const [S, r] of sr) {
    S.top = r.top + sy;
    S.height = r.height;
    S.lastP = -1;
  }
}

function stepScrub(S, sy, vh) {
  let p;
  if (S.mode === "pin") p = (sy - S.top) / Math.max(1, S.height - vh);
  else if (S.mode === "through") p = (sy + vh - S.top) / (S.height + vh);
  else p = (sy + vh * S.from - S.top) / (vh * S.span);
  p = p < 0 ? 0 : p > 1 ? 1 : p;
  if (Math.abs(p - S.lastP) > 0.0004) {
    S.lastP = p;
    S.apply(p);
  }
}

function frame() {
  const sy = window.scrollY;
  const vh = window.innerHeight;
  const centre = sy + vh / 2;

  px += (tpx - px) * 0.075;
  py += (tpy - py) * 0.075;

  for (const L of layers) {
    const d = (centre - L.cy) / vh; // viewports from centre
    if (d > 1.7 || d < -1.7) continue;
    const x = d * L.x * 100 + (L.pointer ? px * L.mx : 0);
    const y = d * L.speed * 100 + (L.pointer ? py * L.my : 0);
    const r = L.rotate ? ` rotate(${(d * L.rotate).toFixed(2)}deg)` : "";
    const next = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)${r}`;
    if (next !== L.last) {
      L.el.style.transform = next;
      L.last = next;
    }
  }

  for (const S of scrubs) stepScrub(S, sy, vh);

  const settling = Math.abs(tpx - px) > 0.002 || Math.abs(tpy - py) > 0.002;
  if (settling || performance.now() - lastInput < 160) requestAnimationFrame(frame);
  else running = false;
}

export function wake() {
  lastInput = performance.now();
  if (!running) {
    running = true;
    requestAnimationFrame(frame);
  }
}

function bind() {
  if (bound) return;
  bound = true;
  window.addEventListener("scroll", wake, { passive: true });
  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      tpx = (e.clientX / window.innerWidth) * 2 - 1;
      tpy = (e.clientY / window.innerHeight) * 2 - 1;
      wake();
    },
    { passive: true }
  );

  let t = 0;
  const remeasure = () => {
    window.clearTimeout(t);
    t = window.setTimeout(() => { measureAll(); wake(); }, 140);
  };
  window.addEventListener("resize", remeasure, { passive: true });
  // Page height changes when a drawer opens or fonts land; every cached
  // position below that point would otherwise be stale.
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(remeasure).observe(document.body);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
}

/**
 * Parallax one element.
 *   speed  – vertical drift across one viewport of travel (+ lags, − leads)
 *   x      – horizontal drift across one viewport of travel
 *   mx, my – px toward the pointer at the screen edge
 *   rotate – degrees across one viewport of travel
 */
export function useParallax({ speed = 0, x = 0, mx = 0, my = 0, rotate = 0, pointer = true, enabled = true } = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    bind();
    const L = { el, speed, x, mx, my, rotate, pointer, cy: 0, last: "" };
    layers.add(L);
    measureAll();
    wake();
    return () => {
      layers.delete(L);
      el.style.transform = "";
    };
  }, [enabled, speed, x, mx, my, rotate, pointer]);
  return ref;
}

export function Parallax({ children, style = {}, className, as: Tag = "div", ...opts }) {
  const ref = useParallax(opts);
  return (
    <Tag ref={ref} className={className} style={{ willChange: opts.enabled === false ? undefined : "transform", ...style }}>
      {children}
    </Tag>
  );
}

/**
 * Drive `apply(progress)` from scroll position.
 *   mode "pin"     – 0 when the element's top meets the viewport top,
 *                    1 when its bottom meets the viewport bottom
 *   mode "through" – 0 as it enters from below, 1 as it leaves above
 *   mode "enter"   – 0 when its top is `from` viewports down,
 *                    1 after `span` viewports of travel
 */
export function useScrubber(apply, { mode = "enter", from = 1, span = 0.8, enabled = true } = {}) {
  const ref = useRef(null);
  const fn = useRef(apply);
  fn.current = apply;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    bind();
    const S = { el, mode, from, span, top: 0, height: 0, lastP: -1, apply: (p) => fn.current(p) };
    scrubs.add(S);
    measureAll();
    // apply once now, so the element starts correct without waiting a frame
    stepScrub(S, window.scrollY, window.innerHeight);
    wake();
    return () => { scrubs.delete(S); };
  }, [enabled, mode, from, span]);

  return ref;
}

/* ─── REVEAL ─────────────────────────────────────────────────
   One shared IntersectionObserver. Mount-time reveals are queued and
   flushed in a microtask — all rects read, all classes written, one
   reflow. Anything already on screen reveals at once and never depends
   on the observer. */

let io = null;
const pending = new Set();
const queue = [];
let queued = false;

function reveal(el) {
  el.classList.add("in");
  pending.delete(el);
  if (io) io.unobserve(el);
  if (el.__onReveal) el.__onReveal();
}

function ensureObserver() {
  if (io || typeof IntersectionObserver === "undefined") return;
  io = new IntersectionObserver(
    (entries) => { for (const e of entries) if (e.isIntersecting) reveal(e.target); },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
  );
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    const vh = window.innerHeight;
    for (const el of [...pending]) {
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) reveal(el);
    }
  });
}

function flush() {
  queued = false;
  const items = queue.splice(0);
  if (!items.length) return;
  const vh = window.innerHeight;
  const rects = items.map((el) => el.getBoundingClientRect());
  // Commit the hidden state with transitions switched off. Without this the
  // element starts *animating toward* hidden, and an on-screen element that is
  // revealed a moment later barely moves — its entrance never really plays.
  for (const el of items) el.classList.add("rv", "rv-init");
  void document.body.offsetHeight;
  for (const el of items) el.classList.remove("rv-init");
  items.forEach((el, i) => {
    const r = rects[i];
    if ((r.top < vh * 0.94 && r.bottom > 0) || !io) reveal(el);
    else { pending.add(el); io.observe(el); }
  });
}

export function useReveal({ enabled = true, onReveal } = {}) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.__onReveal = onReveal;
    if (!enabled) { el.classList.add("rv", "in"); if (onReveal) onReveal(); return; }
    ensureObserver();
    queue.push(el);
    if (!queued) { queued = true; queueMicrotask(flush); }
    return () => { pending.delete(el); if (io) io.unobserve(el); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
  return ref;
}

/** dir: up | down | left | right | scale | fade | tilt */
export function Reveal({ children, dir = "up", delay = 0, enabled = true, as: Tag = "div", style = {}, className = "", ...rest }) {
  const ref = useReveal({ enabled });
  return (
    <Tag ref={ref} data-dir={dir} className={className} style={{ "--d": `${delay}s`, ...style }} {...rest}>
      {children}
    </Tag>
  );
}

/** Words rise from behind their own baseline. Indexes in `accent` get `accentStyle`. */
export function SplitWords({ children, delay = 0, stagger = 0.045, enabled = true, as: Tag = "span", style = {}, accent = [], accentStyle = {} }) {
  const ref = useReveal({ enabled });
  const words = String(children).split(" ");
  return (
    <Tag ref={ref} className="sw" style={{ display: "block", ...style }}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="sw-m">
          <span className="sw-w" style={{ "--d": `${delay + i * stagger}s`, ...(accent.includes(i) ? accentStyle : null) }}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/** Rolls to its value once revealed. Lands on the value even if rAF is starved. */
export function Counter({ value, duration = 1400, enabled = true, pad = 0 }) {
  const [n, setN] = useState(enabled ? 0 : value);
  const run = useCallback(() => {
    const t0 = performance.now();
    let raf = 0;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    window.setTimeout(() => { cancelAnimationFrame(raf); setN(value); }, duration + 300);
  }, [value, duration]);
  const ref = useReveal({ enabled, onReveal: run });
  return <span ref={ref} data-dir="fade">{String(n).padStart(pad, "0")}</span>;
}

/* ─── DECODE ─────────────────────────────────────────────────
   Mono text that resolves out of scrambled characters when it enters
   view, left to right. Renders the real text first, so without JS — or
   if the animation never runs — it simply reads normally. One element,
   one textContent write per frame, for under a second. */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/%$&!{}#*";

export function Decode({ text, as: Tag = "p", className = "", style = {}, delay = 0, enabled = true }) {
  const node = useRef(null);
  const run = useCallback(() => {
    const el = node.current;
    if (!el) return;
    const t0 = performance.now() + delay * 1000;
    const dur = Math.min(1400, 380 + text.length * 14);
    let raf = 0;
    const step = (now) => {
      const p = (now - t0) / dur;
      if (p < 0) { raf = requestAnimationFrame(step); return; }
      if (p >= 1) { el.textContent = text; return; }
      const head = Math.floor(p * text.length);
      let s = text.slice(0, head);
      // everything not yet resolved is a glyph; spaces stay spaces so the
      // line length — and therefore the layout — never changes mid-decode
      for (let i = head; i < text.length; i += 1) {
        s += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = s;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    // land on the real text even if rAF is starved
    window.setTimeout(() => { cancelAnimationFrame(raf); if (node.current) node.current.textContent = text; }, dur + delay * 1000 + 400);
  }, [text, delay]);

  const ref = useReveal({ enabled, onReveal: enabled ? run : undefined });
  const setRef = (el) => { ref.current = el; node.current = el; };
  return <Tag ref={setRef} data-dir="fade" className={className} style={style}>{text}</Tag>;
}

/* ─── MAGNETIC / TILT ────────────────────────────────────── */

export function Magnetic({ children, strength = 0.25, enabled = true }) {
  const inner = useRef(null);
  const move = (e) => {
    const el = inner.current;
    if (!enabled || !el) return;
    const r = el.getBoundingClientRect();
    el.style.transition = "transform .12s linear";
    el.style.transform = `translate3d(${(e.clientX - r.left - r.width / 2) * strength}px,${(e.clientY - r.top - r.height / 2) * strength}px,0)`;
  };
  const leave = () => {
    const el = inner.current;
    if (!el) return;
    el.style.transition = `transform .7s ${EASE.spring}`;
    el.style.transform = "translate3d(0,0,0)";
  };
  return (
    <span onMouseMove={move} onMouseLeave={leave} style={{ display: "inline-block" }}>
      <span ref={inner} style={{ display: "inline-block" }}>{children}</span>
    </span>
  );
}

export function Tilt({ children, max = 5, enabled = true, style = {}, className = "" }) {
  const ref = useRef(null);
  const raf = useRef(0);
  const tgt = useRef({ x: 0, y: 0 });
  const apply = () => {
    raf.current = 0;
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(1100px) rotateX(${(-tgt.current.y * max).toFixed(2)}deg) rotateY(${(tgt.current.x * max).toFixed(2)}deg)`;
  };
  const move = (e) => {
    if (!enabled) return;
    const r = ref.current.getBoundingClientRect();
    tgt.current = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 };
    ref.current.style.transition = "transform .08s linear";
    if (!raf.current) raf.current = requestAnimationFrame(apply);
  };
  const leave = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = 0;
    const el = ref.current;
    if (!el) return;
    el.style.transition = `transform .9s ${EASE.out}`;
    el.style.transform = "perspective(1100px) rotateX(0) rotateY(0)";
  };
  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave} className={className} style={{ transformStyle: "preserve-3d", ...style }}>
      {children}
    </div>
  );
}

/* ─── MOTION CSS ─────────────────────────────────────────────
   Every hidden state is scoped to `.rv:not(.in)`: pending reveals only.
   If JavaScript never runs, nothing is hidden. */
export const MOTION_CSS = `
  .rv-init,.rv-init *{transition:none!important}
  .rv{transition:opacity .95s ${EASE.out},transform 1.1s ${EASE.out};transition-delay:var(--d,0s)}
  .rv:not(.in){opacity:0}
  .rv:not(.in)[data-dir=up]{transform:translate3d(0,42px,0)}
  .rv:not(.in)[data-dir=down]{transform:translate3d(0,-42px,0)}
  .rv:not(.in)[data-dir=left]{transform:translate3d(-60px,0,0)}
  .rv:not(.in)[data-dir=right]{transform:translate3d(60px,0,0)}
  .rv:not(.in)[data-dir=scale]{transform:scale(.94)}
  .rv:not(.in)[data-dir=tilt]{transform:perspective(1000px) rotateX(12deg) translate3d(0,46px,0);transform-origin:50% 100%}

  .sw-m{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.12em;margin-bottom:-.12em}
  .sw-w{display:inline-block;transition:transform 1.15s ${EASE.out};transition-delay:var(--d,0s)}
  .sw.rv{opacity:1!important;transform:none!important}
  .sw.rv:not(.in) .sw-w{transform:translate3d(0,112%,0) rotate(3deg)}

  /* a panel that wipes off whatever it covers */
  .wipe{position:relative;overflow:hidden}
  .wipe-cover{position:absolute;inset:0;z-index:3;background:${T.blue};transform:translate3d(101%,0,0);transition:transform 1.05s ${EASE.inOut};transition-delay:var(--d,0s);pointer-events:none}
  .wipe-art{transition:transform 1.5s ${EASE.out};transition-delay:var(--d,0s)}
  .rv:not(.in) .wipe-cover{transform:translate3d(0,0,0)}
  .rv:not(.in) .wipe-art{transform:scale(1.12)}

  /* a hairline that draws itself */
  .rule{height:1px;background:${T.line2};transform-origin:left;transition:transform 1.3s ${EASE.out};transition-delay:var(--d,0s)}
  .rv:not(.in) .rule,.rule.rv:not(.in){transform:scaleX(0)}

  @media (prefers-reduced-motion: reduce){
    .rv,.sw-w,.wipe-cover,.wipe-art,.rule{transition:none!important}
    .rv:not(.in){opacity:1!important;transform:none!important}
    .rv:not(.in) .sw-w,.rv:not(.in) .wipe-art,.rv:not(.in) .rule{transform:none!important}
    .rv:not(.in) .wipe-cover{transform:translate3d(101%,0,0)!important}
  }
`;
