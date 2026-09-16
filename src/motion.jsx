import { useState, useEffect, useRef, useCallback } from "react";
import { T, GLASS, EASE, FONT, TYPE, blueA, whiteA } from "./theme.js";

/* ─────────────────────────────────────────────────────────
   MOTION ENGINE

   One requestAnimationFrame loop writes four CSS custom properties
   on <html>, and every parallax transform on the page is expressed
   in calc() against them. Nothing here re-renders React, so a page
   with fifteen project rows still scrolls at frame rate.

     --sy    eased scroll position, px (lags real scroll → inertia)
     --sv    scroll velocity, roughly -1..1 (drives skew / stretch)
     --mx    pointer x, -1..1, eased
     --my    pointer y, -1..1, eased
     --prog  document scroll progress, 0..1
   ───────────────────────────────────────────────────────── */

export function useMotionEngine(enabled = true) {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;

    let ease = window.scrollY;
    let last = window.scrollY;
    let vel = 0;
    let dir = 1;
    let mx = 0, my = 0, tmx = 0, tmy = 0;

    const onMove = (e) => {
      tmx = (e.clientX / window.innerWidth) * 2 - 1;
      tmy = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const tick = () => {
      const y = window.scrollY;
      const delta = y - last;
      last = y;

      // normalise and damp the velocity so a flick doesn't spike the skew
      const target = Math.max(-1, Math.min(1, delta / 70));
      vel += (target - vel) * 0.14;
      if (Math.abs(vel) < 0.0006) vel = 0;

      // latch direction off a real movement, not off jitter
      if (Math.abs(delta) > 0.6) dir = delta > 0 ? 1 : -1;

      ease += (y - ease) * 0.09;
      mx += (tmx - mx) * 0.065;
      my += (tmy - my) * 0.065;

      const max = Math.max(1, document.body.scrollHeight - window.innerHeight);

      root.style.setProperty("--sy", ease.toFixed(2));
      root.style.setProperty("--sv", vel.toFixed(4));
      root.style.setProperty("--mx", mx.toFixed(4));
      root.style.setProperty("--my", my.toFixed(4));
      root.style.setProperty("--prog", (y / max).toFixed(4));
      root.style.setProperty("--dir", String(dir));

      raf = requestAnimationFrame(tick);
    };

    if (!enabled) {
      // keep progress live, but pin every motion channel to rest
      for (const [k, v] of [["--sy", "0"], ["--sv", "0"], ["--mx", "0"], ["--my", "0"], ["--dir", "1"]]) {
        root.style.setProperty(k, v);
      }
      const onScroll = () => {
        const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
        root.style.setProperty("--prog", (window.scrollY / max).toFixed(4));
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);
}

/** Coarse scroll state for things that genuinely need React (nav chrome). */
export function useScrolled(threshold = 30) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      setPast((p) => {
        const next = window.scrollY > threshold;
        return next === p ? p : next;
      });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(check); };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold]);
  return past;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReduced(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  return reduced;
}

export function useIsMobile(breakpoint = 860) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return mobile;
}

const watchers = new Set();
let watchScheduled = false;
let watchBound = false;
let watchTimer = 0;

function flushWatchers() {
  watchScheduled = false;
  if (!watchers.size) return;
  const vh = window.innerHeight || 0;

  // read every rect first, then let React batch the state writes
  const reads = [];
  for (const w of watchers) reads.push([w, w.el.getBoundingClientRect()]);

  for (const [w, r] of reads) {
    if (r.height === 0 && r.width === 0) continue; // not laid out yet
    const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    const basis = Math.min(r.height, vh) || 1;
    const hit = visible > 0 && visible / basis >= Math.min(w.threshold, 0.95);
    if (hit) {
      w.set(true);
      if (w.once) watchers.delete(w);
    } else if (!w.once) {
      w.set(false);
    }
  }

  if (!watchers.size && watchTimer) {
    window.clearInterval(watchTimer);
    watchTimer = 0;
  }
}

function scheduleWatch() {
  if (watchScheduled) return;
  watchScheduled = true;
  requestAnimationFrame(flushWatchers);
  // rAF never runs on a page that is not painting - this fallback is the
  // whole reason visibility no longer depends on IntersectionObserver
  window.setTimeout(() => { if (watchScheduled) flushWatchers(); }, 100);
}

function bindWatch() {
  if (!watchBound) {
    watchBound = true;
    window.addEventListener("scroll", scheduleWatch, { passive: true });
    window.addEventListener("resize", scheduleWatch);
  }
  // slow heartbeat catches late layout: fonts landing, images decoding,
  // a panel expanding and pushing everything below it down
  if (!watchTimer) watchTimer = window.setInterval(scheduleWatch, 300);
}

/**
 * True once the element has been on screen. Rect-based rather than
 * IntersectionObserver, so it cannot be stranded by a page that is not
 * being painted.
 */
export function useInView(threshold = 0.12, once = true) {
  const [node, setNode] = useState(null);
  const [inView, setInView] = useState(false);
  const ref = useCallback((n) => setNode(n), []);

  useEffect(() => {
    if (!node) return;
    const w = { el: node, threshold, once, set: setInView };
    watchers.add(w);
    bindWatch();
    scheduleWatch();
    return () => { watchers.delete(w); };
  }, [node, threshold, once]);

  return [ref, inView];
}

/* ─────────────────────────────────────────────────────────
   SCROLL SCRUB

   Entry animation tied to where an element actually sits in the
   viewport, not to a boolean "has it crossed the line". One shared
   subscriber list, one batched pass — every rect is read, then
   every style is written, so the browser never thrashes layout.

   Falls back to a timer if rAF is starved (a page that is not
   painting still fires scroll events), which keeps content from
   being stranded mid-animation.
   ───────────────────────────────────────────────────────── */

const scrubbers = new Set();
let scrubScheduled = false;
let scrubBound = false;
let scrubLastY = typeof window === "undefined" ? 0 : window.scrollY;
let scrubDir = 1;

function flushScrub() {
  scrubScheduled = false;
  const vh = window.innerHeight || 1;

  const y = window.scrollY;
  if (Math.abs(y - scrubLastY) > 0.6) {
    scrubDir = y > scrubLastY ? 1 : -1;
    scrubLastY = y;
  }

  // read phase
  const reads = [];
  for (const item of scrubbers) {
    if (!item.el) continue;
    reads.push([item, item.el.getBoundingClientRect()]);
  }
  // write phase
  for (const [item, rect] of reads) {
    const span = vh * item.span;
    const raw = (vh - rect.top) / (span || 1);
    const p = raw < 0 ? 0 : raw > 1 ? 1 : raw;
    if (p !== item.last) {
      item.last = p;
      item.apply(item.el, p, scrubDir);
    }
  }
}

function scheduleScrub() {
  if (scrubScheduled) return;
  scrubScheduled = true;
  requestAnimationFrame(flushScrub);
  // rAF never runs on a page that is not being painted; this keeps
  // the scrub honest in a background tab or an occluded window.
  setTimeout(() => { if (scrubScheduled) flushScrub(); }, 110);
}

function bindScrub() {
  if (scrubBound) return;
  scrubBound = true;
  window.addEventListener("scroll", scheduleScrub, { passive: true });
  window.addEventListener("resize", scheduleScrub);
}

/**
 * Drives `apply(el, progress)` as the element rises through the viewport.
 * `span` is the travel distance as a fraction of viewport height.
 */
export function useScrub(apply, { span = 0.8 } = {}) {
  const [node, setNode] = useState(null);
  const ref = useCallback((n) => setNode(n), []);
  const applyRef = useRef(apply);
  applyRef.current = apply;

  useEffect(() => {
    if (!node) return;
    const item = { el: node, span, last: -1, apply: (el, p, dir) => applyRef.current(el, p, dir) };
    scrubbers.add(item);
    bindScrub();
    scheduleScrub();
    return () => { scrubbers.delete(item); };
  }, [node, span]);

  return ref;
}

/**
 * Scroll-scrubbed entry. Rises, un-blurs, and rotates out of the page
 * plane in step with the scroll — so the motion belongs to the scroll
 * rather than firing once and finishing on its own clock.
 */
export function ScrubIn({
  children, lift = 46, rotate = 9, blur = 6, shift = 0, span = 0.78,
  enabled = true, style = {},
}) {
  // The side an element enters from follows the direction of travel: scrolling
  // down it rises from below, scrolling up it comes back down from above. The
  // sign is latched while the element is still fully hidden, so reversing
  // mid-animation eases rather than snapping.
  const sign = useRef(1);

  const ref = useScrub((el, p, dir) => {
    if (p <= 0.02) sign.current = dir >= 0 ? 1 : -1;
    const s = sign.current;
    const e = 1 - Math.pow(1 - p, 3);
    const rest = 1 - e;

    el.style.opacity = String(Math.min(1, e * 1.35));
    el.style.transform =
      `translate3d(${(rest * shift * s).toFixed(2)}px, ${(rest * lift * s).toFixed(2)}px, 0) ` +
      `rotateX(${(rest * rotate * s).toFixed(2)}deg)`;
    el.style.filter = e > 0.97 ? "none" : `blur(${(rest * blur).toFixed(2)}px)`;
  }, { span });

  if (!enabled) return <div style={style}>{children}</div>;

  return (
    <div style={{ perspective: "1000px", ...style }}>
      <div
        ref={ref}
        style={{
          opacity: 0,
          transformOrigin: "center top",
          willChange: "transform, opacity, filter",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Current scroll direction as React state, for chrome that must re-render. */
export function useScrollDirection() {
  const [dir, setDir] = useState("up");
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const read = () => {
      frame = 0;
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      setDir(y > last ? "down" : "up");
      last = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
      window.setTimeout(() => { if (frame) { cancelAnimationFrame(frame); read(); } }, 90);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return dir;
}

/** Scroll-scrubbed parallax drift for any element. */
export function ScrubShift({ children, distance = -60, span = 1.4, enabled = true, style = {} }) {
  const ref = useScrub((el, p) => {
    el.style.transform = `translate3d(0, ${(p * distance).toFixed(2)}px, 0)`;
  }, { span });
  if (!enabled) return <div style={style}>{children}</div>;
  return <div ref={ref} style={{ willChange: "transform", ...style }}>{children}</div>;
}

/* ─── SCROLL HIGHLIGHT ───────────────────────────
   A paragraph that lights word by word as it travels up the
   viewport. Each word gets its own slice of the block's scroll
   progress, so the sentence reads itself. Styles are written
   straight to the spans — no React render per frame.
   ─────────────────────────────────────────────────── */
export function ScrollHighlight({ children, dim = 0.2, span = 1.05, enabled = true, style = {} }) {
  const words = String(children).split(" ");

  const ref = useScrub((el, p) => {
    const spans = el.children;
    const n = spans.length;
    if (!n) return;
    for (let i = 0; i < n; i += 1) {
      // words finish lighting by 78% of the travel, so the last word is lit
      // well before the block leaves the viewport
      const start = (i / n) * 0.78;
      const local = Math.max(0, Math.min(1, (p - start) / 0.22));
      spans[i].style.opacity = String(dim + local * (1 - dim));
    }
  }, { span });

  if (!enabled) return <p style={style}>{children}</p>;

  return (
    <p ref={ref} style={style}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} style={{ opacity: dim, transition: "opacity 0.25s linear" }}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}

/* ─── SCRUB BAR ─────────────────────────────────
   A rail that fills in step with the scroll — the spine of the
   experience timeline. */
export function ScrubBar({ span = 1.5, width = 1, colour, glow, style = {} }) {
  const ref = useScrub((el, p) => {
    el.style.transform = `scaleY(${p.toFixed(4)})`;
  }, { span });

  return (
    <span
      aria-hidden="true"
      style={{ position: "absolute", top: 0, bottom: 0, width, overflow: "hidden", ...style }}
    >
      <span style={{ position: "absolute", inset: 0, background: "currentColor", opacity: 0.16 }} />
      <span
        ref={ref}
        style={{
          position: "absolute", inset: 0,
          background: colour,
          boxShadow: glow,
          transformOrigin: "top",
          transform: "scaleY(0)",
          willChange: "transform",
        }}
      />
    </span>
  );
}

/* ─── CUSTOM CURSOR ───────────────────────────────────────
   Two parts: a hard dot pinned to the pointer, and a glass ring
   that lags behind it and swells over anything interactive. The
   ring is a real frosted disc — it blurs whatever it passes over.
   Elements opt in with data-cursor="link" | "expand" | "text".
   ───────────────────────────────────────────────────────── */
export function Cursor({ enabled }) {
  const dot = useRef(null);
  const ring = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    document.body.style.cursor = "none";

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let rx = tx, ry = ty;
    let scale = 1, tScale = 1;
    let stretch = 0;
    let raf = 0;
    let mode = "";

    const setMode = (next, text) => {
      if (next === mode) return;
      mode = next;
      const r = ring.current;
      const l = label.current;
      if (!r || !l) return;
      tScale = next === "expand" ? 2.35 : next === "link" ? 1.7 : next === "text" ? 0.35 : 1;
      r.style.borderColor = next ? whiteA(0.55) : whiteA(0.28);
      r.style.background = next === "expand" ? blueA(0.14) : whiteA(0.03);
      l.textContent = text || "";
      l.style.opacity = text ? "1" : "0";
    };

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
      }
      const hit = e.target instanceof Element ? e.target.closest("[data-cursor]") : null;
      setMode(hit ? hit.getAttribute("data-cursor") : "", hit ? hit.getAttribute("data-cursor-label") : "");
    };

    const onDown = () => { scale *= 0.8; };
    const onLeave = () => { if (ring.current) ring.current.style.opacity = "0"; if (dot.current) dot.current.style.opacity = "0"; };
    const onEnter = () => { if (ring.current) ring.current.style.opacity = "1"; if (dot.current) dot.current.style.opacity = "1"; };

    const tick = () => {
      const dx = tx - rx;
      const dy = ty - ry;
      rx += dx * 0.16;
      ry += dy * 0.16;
      scale += (tScale - scale) * 0.16;

      // stretch along the direction of travel, squash across it — the ring
      // reads as something with mass being dragged rather than a floating disc
      const speed = Math.min(1, Math.hypot(dx, dy) / 90);
      stretch += (speed - stretch) * 0.2;
      const angle = (stretch > 0.01 ? Math.atan2(dy, dx) : 0) * (180 / Math.PI);
      const sx = 1 + stretch * 0.55;
      const sy = 1 - stretch * 0.32;

      if (ring.current) {
        ring.current.style.transform =
          `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) ` +
          `rotate(${angle.toFixed(1)}deg) scale(${(scale * sx).toFixed(3)}, ${(scale * sy).toFixed(3)})`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    raf = requestAnimationFrame(tick);

    return () => {
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ring}
        aria-hidden="true"
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 9998,
          width: 34, height: 34, borderRadius: "50%",
          border: `1px solid ${whiteA(0.28)}`,
          background: whiteA(0.03),
          backdropFilter: "blur(3px) saturate(150%)",
          WebkitBackdropFilter: "blur(3px) saturate(150%)",
          pointerEvents: "none",
          transition: "border-color 0.3s ease, background 0.3s ease, opacity 0.25s ease",
          display: "flex", alignItems: "center", justifyContent: "center",
          willChange: "transform",
        }}
      >
        <span
          ref={label}
          style={{
            fontFamily: FONT.mono, fontSize: "4.6px", letterSpacing: "0.1em",
            textTransform: "uppercase", color: T.white, opacity: 0,
            transition: "opacity 0.25s ease", whiteSpace: "nowrap", pointerEvents: "none",
            mixBlendMode: "difference",
          }}
        />
      </div>
      <div
        ref={dot}
        aria-hidden="true"
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 9999,
          width: 5, height: 5, borderRadius: "50%", background: T.blue,
          pointerEvents: "none", willChange: "transform",
          transition: "opacity 0.25s ease",
        }}
      />
    </>
  );
}

/* ─── BORDER BEAM ─────────────────────────────────
   A light that travels the edge of a card. The wrapper is masked
   down to a one-pixel ring (content-box XOR border-box), and a
   large conic gradient spins inside it — so the glow orbits the
   border without covering the frosted surface.
   ─────────────────────────────────────────────────── */
export function BorderBeam({ active = false, duration = 3.4, width = 1, radius = 0 }) {
  const ring = {
    position: "absolute",
    inset: 0,
    borderRadius: radius,
    padding: width,
    pointerEvents: "none",
    overflow: "hidden",
    opacity: active ? 1 : 0,
    transition: "opacity 0.45s ease",
    WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
  };

  return (
    <span aria-hidden="true" style={ring}>
      <span
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "180%",
          aspectRatio: "1 / 1",
          transform: "translate(-50%, -50%)",
          background:
            "conic-gradient(from 0deg, transparent 0%, rgba(44,100,255,0) 6%, " +
            "rgba(44,100,255,0.9) 13%, rgba(124,160,255,1) 17%, rgba(44,100,255,0) 26%, transparent 100%)",
          animation: active ? `beamSpin ${duration}s linear infinite` : "none",
          willChange: "transform",
        }}
      />
    </span>
  );
}

/* ─── COUNTER ────────────────────────────────────
   Rolls to its value once, on a cubic ease-out. */
export function Counter({ value, duration = 1100, enabled = true }) {
  const [ref, inView] = useInView(0.4);
  const [n, setN] = useState(enabled ? 0 : value);

  useEffect(() => {
    if (!enabled) { setN(value); return; }
    if (!inView) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    // rAF is starved on a page that is not painting; land on the value anyway
    const settle = window.setTimeout(() => setN(value), duration + 260);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(settle); };
  }, [inView, value, duration, enabled]);

  return <span ref={ref}>{n}</span>;
}

/* ─── HOVER DECODE ──────────────────────────────
   Resolves a string out of noise while `active` is true, then
   holds. Letters land left to right, so it reads as decoding
   rather than as random flicker. */
export function useHoverDecode(text, active, { enabled = true, speed = 2 } = {}) {
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (!enabled || !active) { setOut(text); return; }
    const glyphs = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/#*<>•";
    let frame = 0;
    let raf = 0;
    const total = text.length * speed + 6;

    const step = () => {
      frame += 1;
      const revealed = Math.floor(frame / speed);
      let next = "";
      for (let i = 0; i < text.length; i += 1) {
        const ch = text[i];
        if (ch === " " || i < revealed) next += ch;
        else next += glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      setOut(next);
      if (frame < total) raf = requestAnimationFrame(step);
      else setOut(text);
    };

    raf = requestAnimationFrame(step);
    const settle = window.setTimeout(() => setOut(text), 900);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(settle); };
  }, [text, active, enabled, speed]);

  return out;
}

/* ─── SPLIT TEXT ──────────────────────────────────────────
   Per-word mask reveal. Each word sits in an overflow-hidden box
   and rises from below its own baseline, so the line assembles
   rather than fading in.
   ───────────────────────────────────────────────────────── */
export function SplitText({ children, delay = 0, stagger = 0.045, style = {}, as: Tag = "span", enabled = true, hold = false }) {
  const [ref, inView] = useInView(0.18);
  const words = String(children).split(" ");
  const show = !enabled || (inView && !hold);

  return (
    <Tag ref={ref} style={{ ...style, display: "block" }}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.08em" }}>
          <span
            style={{
              display: "inline-block",
              transform: show ? "translateY(0)" : "translateY(105%)",
              transition: `transform 0.95s ${EASE.out} ${delay + i * stagger}s`,
              willChange: "transform",
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/* ─── SCRAMBLE LABEL ──────────────────────────────────────
   Mono labels resolve out of noise when they enter view. Cheap,
   short, and it makes the section markers feel like instruments.
   ───────────────────────────────────────────────────────── */
export function Scramble({ text, style = {}, enabled = true, delay = 0 }) {
  const [ref, inView] = useInView(0.5);
  // Start on the real text. If the scramble never runs the label is simply
  // static rather than blank.
  const [out, setOut] = useState(text);

  useEffect(() => {
    if (!enabled) { setOut(text); return; }
    if (!inView) return;
    const glyphs = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/#*<>";
    let frame = 0;
    let raf = 0;
    let timer = 0;

    const run = () => {
      const total = text.length * 3 + 10;
      const step = () => {
        frame += 1;
        const revealed = Math.floor(frame / 3);
        let s = "";
        for (let i = 0; i < text.length; i += 1) {
          if (text[i] === " ") { s += " "; continue; }
          s += i < revealed ? text[i] : glyphs[Math.floor(Math.random() * glyphs.length)];
        }
        setOut(s);
        if (frame < total) raf = requestAnimationFrame(step);
        else setOut(text);
      };
      raf = requestAnimationFrame(step);
    };

    timer = window.setTimeout(run, delay * 1000);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(timer); };
  }, [inView, text, enabled, delay]);

  return <span ref={ref} style={style}>{out || " "}</span>;
}

/* ─── MAGNETIC ────────────────────────────────────────────
   Pulls toward the pointer while it is near, then springs back.
   ───────────────────────────────────────────────────────── */
export function Magnetic({ children, strength = 0.32, enabled = true, style = {} }) {
  const ref = useRef(null);

  const onMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!enabled || !el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transition = "transform 0.1s linear";
      el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
    },
    [enabled, strength]
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = `transform 0.6s ${EASE.spring}`;
    el.style.transform = "translate3d(0,0,0)";
  }, []);

  return (
    <span
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ display: "inline-block", ...style }}
    >
      <span ref={ref} style={{ display: "inline-block", willChange: "transform" }}>{children}</span>
    </span>
  );
}

/* ─── GLASS PANEL ─────────────────────────────────────────
   Frosted pane with a glare that tracks the pointer across it —
   the thing that makes a surface read as glass rather than as a
   grey box with blur behind it.
   ───────────────────────────────────────────────────────── */
export function Glass({ children, lit = false, tilt = 0, enabled = true, radius = 2, style = {}, glare = true, beam = false, depth = 0, ...rest }) {
  const ref = useRef(null);
  const glareRef = useRef(null);
  const [hover, setHover] = useState(false);

  const onMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!enabled || !el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      if (tilt) {
        el.style.transform = `perspective(1100px) rotateX(${(0.5 - py) * tilt * 2}deg) rotateY(${(px - 0.5) * tilt * 2}deg) translateZ(10px)`;
      }
      if (glareRef.current) {
        glareRef.current.style.background =
          `radial-gradient(380px circle at ${(px * 100).toFixed(1)}% ${(py * 100).toFixed(1)}%, ${whiteA(0.09)} 0%, ${blueA(0.05)} 32%, transparent 62%)`;
      }
    },
    [enabled, tilt, glare]
  );

  const onLeave = useCallback(() => {
    setHover(false);
    const el = ref.current;
    if (el && tilt) {
      el.style.transition = `transform 0.7s ${EASE.out}`;
      el.style.transform = "none";
    }
  }, [tilt]);

  const onEnter = useCallback(() => {
    setHover(true);
    const el = ref.current;
    if (el && tilt) el.style.transition = "transform 0.14s ease-out";
  }, [tilt]);

  const surface = lit || hover ? GLASS.panelLit : GLASS.panel;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        position: "relative",
        borderRadius: radius,
        transformStyle: tilt ? "preserve-3d" : undefined,
        willChange: tilt ? "transform" : undefined,
        transition: "background 0.45s ease, border-color 0.45s ease, box-shadow 0.45s ease",
        ...surface,
        ...style,
      }}
      {...rest}
    >
      {glare && enabled && (
        <span
          ref={glareRef}
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0, borderRadius: radius, pointerEvents: "none",
            opacity: hover ? 1 : 0, transition: "opacity 0.45s ease", mixBlendMode: "screen",
          }}
        />
      )}

      {beam && enabled && <BorderBeam active={hover} radius={radius} />}

      {/* Lifting the content off the surface is what makes a tilted card read
          as a pane with things sitting on it, rather than a printed picture. */}
      {depth && tilt ? (
        <div style={{ position: "relative", transform: `translateZ(${depth}px)`, transformStyle: "preserve-3d" }}>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

/* ─── REVEAL ──────────────────────────────────────────────
   Rise + clip. The clip is what stops it reading as a plain fade.
   ───────────────────────────────────────────────────────── */
export function Reveal({ children, delay = 0, distance = 26, blur = true, style = {}, enabled = true }) {
  const [ref, inView] = useInView(0.1);
  const on = inView || !enabled;
  return (
    <div
      ref={ref}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "none" : `translate3d(0, ${distance}px, 0)`,
        filter: on || !blur ? "none" : "blur(7px)",
        clipPath: on ? "inset(0% 0% -20% 0%)" : "inset(0% 0% 100% 0%)",
        transition:
          `opacity 0.85s ${EASE.out} ${delay}s, transform 0.95s ${EASE.out} ${delay}s, ` +
          `filter 0.85s ${EASE.out} ${delay}s, clip-path 1s ${EASE.out} ${delay}s`,
        willChange: "transform, opacity",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Hairline that draws itself in from the left. */
export function DrawRule({ delay = 0, colour = T.line2 }) {
  const [ref, inView] = useInView(0.2);
  return (
    <div ref={ref} style={{ height: "1px", background: T.line, overflow: "hidden" }}>
      <div
        style={{
          height: "100%", background: colour, transformOrigin: "left",
          transform: inView ? "scaleX(1)" : "scaleX(0)",
          transition: `transform 1.1s ${EASE.out} ${delay}s`,
        }}
      />
    </div>
  );
}

/* ─── ATMOSPHERE ──────────────────────────────────────────
   Film grain + drifting aurora. Both fixed behind everything, both
   driven by the CSS vars, so they cost nothing per frame in React.
   ───────────────────────────────────────────────────────── */
export function Grain({ opacity = 0.035 }) {
  const noise =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>
         <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/></filter>
         <rect width='100%' height='100%' filter='url(#n)' opacity='0.55'/>
       </svg>`
    );
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed", inset: "-120px", zIndex: 3, pointerEvents: "none",
        backgroundImage: `url("${noise}")`, opacity,
        mixBlendMode: "overlay", animation: "grainShift 7s steps(6) infinite",
      }}
    />
  );
}

export function Aurora({ mobile }) {
  const blobs = [
    { c: blueA(0.16), s: mobile ? 420 : 760, top: "-8%",  left: "-6%",  d: 0.9, t: "22s" },
    { c: "rgba(70,140,255,0.10)", s: mobile ? 360 : 620, top: "34%", left: "62%", d: 1.5, t: "28s" },
    { c: "rgba(20,60,190,0.13)",  s: mobile ? 400 : 700, top: "72%", left: "12%", d: 0.6, t: "34s" },
  ];
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute", top: b.top, left: b.left, width: b.s, height: b.s,
            background: `radial-gradient(circle, ${b.c} 0%, transparent 66%)`,
            filter: "blur(18px)",
            transform: `translate3d(calc(var(--mx) * ${-24 * b.d}px), calc(var(--sy) * ${-0.035 * b.d}px + var(--my) * ${-18 * b.d}px), 0)`,
            animation: `auroraDrift ${b.t} ease-in-out ${i * 2}s infinite`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}

/* ─── FLOATING GLASS SHARDS ───────────────────────────────
   Empty frosted panes at different depths. Pure decoration, but it
   is what gives the hero a sense of volume rather than a backdrop.
   ───────────────────────────────────────────────────────── */
export function Shards({ items }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {items.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: s.top, left: s.left, right: s.right, bottom: s.bottom,
            width: s.w, height: s.h,
            ...GLASS.panel,
            background: "linear-gradient(150deg, rgba(255,255,255,0.045), rgba(255,255,255,0.008))",
            boxShadow: `0 30px 60px -40px rgba(0,0,0,0.9), inset 0 1px 0 ${whiteA(0.09)}`,
            transform:
              `translate3d(calc(var(--mx) * ${-18 * s.d}px), calc(var(--sy) * ${-0.07 * s.d}px + var(--my) * ${-12 * s.d}px), 0) ` +
              `rotate(${s.r}deg)`,
            animation: `shardFloat ${8 + i * 2.5}s ease-in-out ${i * 0.9}s infinite`,
            willChange: "transform",
            opacity: s.o ?? 1,
          }}
        />
      ))}
    </div>
  );
}

/* ─── INTRO ───────────────────────────────────────────────
   Two panes slide apart over a count-in. Short — 1.5s to interactive.
   ───────────────────────────────────────────────────────── */
export function Intro({ onDone, enabled }) {
  const [phase, setPhase] = useState(0);

  // onDone is nearly always an inline arrow, so it has a new identity on every
  // render. Depending on it here would clear and restart these timers on each
  // re-render, and the intro would never reach the phase where it unmounts.
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (!enabled) { done.current?.(); return; }
    const a = setTimeout(() => setPhase(1), 620);
    const b = setTimeout(() => { setPhase(2); done.current?.(); }, 1500);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [enabled]);

  if (!enabled || phase === 2) return null;

  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 9000, pointerEvents: "none" }}>
      {[0, 1].map((half) => (
        <div
          key={half}
          style={{
            position: "absolute", left: 0, right: 0, height: "50.5%",
            [half ? "bottom" : "top"]: 0,
            background: T.ink,
            transform: phase >= 1 ? `translateY(${half ? "100%" : "-100%"})` : "none",
            transition: `transform 0.95s ${EASE.inOut}`,
            borderBottom: half ? "none" : `1px solid ${blueA(0.35)}`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          opacity: phase >= 1 ? 0 : 1, transition: "opacity 0.4s ease",
        }}
      >
        <span style={{ ...TYPE.label, fontSize: "0.6rem", color: T.blue }}>SURYA&nbsp;J — DARX</span>
      </div>
    </div>
  );
}
