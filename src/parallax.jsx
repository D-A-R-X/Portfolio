import { useState, useEffect, useRef, useCallback } from "react";
import { T, FONT, TYPE, blueA } from "./theme.js";

/* ─── ENVIRONMENT ─────────────────────────────────────────── */

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

export function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { setY(window.scrollY); frame = 0; });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return y;
}

/** Normalised pointer, -1..1, eased. Drives every parallax offset on the page. */
export function usePointer(enabled = true) {
  const [p, setP] = useState({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const onMove = (e) => {
      target.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };
    const tick = () => {
      const c = current.current;
      const t = target.current;
      const nx = c.x + (t.x - c.x) * 0.06;
      const ny = c.y + (t.y - c.y) * 0.06;
      if (Math.abs(nx - c.x) > 0.0005 || Math.abs(ny - c.y) > 0.0005) {
        current.current = { x: nx, y: ny };
        setP({ x: nx, y: ny });
      }
      frame = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  return enabled ? p : { x: 0, y: 0 };
}

export function useInView(threshold = 0.14, once = true) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
        else if (!once) setInView(false);
      },
      { threshold }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold, once]);
  return [ref, inView];
}

/** -1 (below fold) → 0 (centred) → 1 (above), for scroll-linked depth. */
export function useSectionProgress() {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const measure = () => {
      const r = node.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const centre = r.top + r.height / 2;
      setProgress(Math.max(-1.5, Math.min(1.5, (vh / 2 - centre) / (vh / 2 + r.height / 2))));
      frame = 0;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return [ref, progress];
}

/* ─── DEPTH PRIMITIVES ────────────────────────────────────── */

/** A plane at a given depth. Higher depth = nearer = moves more. */
export function Layer({ depth = 1, scrollY = 0, pointer = { x: 0, y: 0 }, style = {}, children }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        pointerEvents: "none",
        willChange: "transform",
        transform: `translate3d(${pointer.x * depth * -16}px, ${scrollY * depth * 0.05 + pointer.y * depth * -11}px, 0)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Nested hairline frames rotating as one rigid body toward the pointer — the
 * page's main 3D object. Reads as construction drawing, not neon.
 */
export function DepthFrames({ pointer = { x: 0, y: 0 }, size = 420, enabled = true, children }) {
  const rx = enabled ? pointer.y * -7 : 0;
  const ry = enabled ? pointer.x * 9 : 0;

  const frames = [
    { z: -170, inset: -38, colour: T.line, dash: "3 6" },
    { z: -110, inset: -24, colour: T.line2, dash: null },
    { z: -55,  inset: -11, colour: T.line2, dash: null },
  ];

  return (
    <div style={{ perspective: "1500px", width: size, height: size, position: "relative" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `rotateX(${rx}deg) rotateY(${ry}deg)`,
          transition: "transform 0.2s ease-out",
          willChange: "transform",
        }}
      >
        {frames.map((f) => (
          <div
            key={f.z}
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: f.inset,
              border: `1px ${f.dash ? "dashed" : "solid"} ${f.colour}`,
              transform: `translateZ(${f.z}px)`,
            }}
          />
        ))}
        {/* corner ticks on the mid frame */}
        {[["0", "0"], ["0", "auto"], ["auto", "0"], ["auto", "auto"]].map(([t, l], i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: t === "0" ? -25 : "auto",
              bottom: t === "auto" ? -25 : "auto",
              left: l === "0" ? -25 : "auto",
              right: l === "auto" ? -25 : "auto",
              width: 9, height: 9,
              borderTop: t === "0" ? `1px solid ${T.blue}` : "none",
              borderBottom: t === "auto" ? `1px solid ${T.blue}` : "none",
              borderLeft: l === "0" ? `1px solid ${T.blue}` : "none",
              borderRight: l === "auto" ? `1px solid ${T.blue}` : "none",
              transform: "translateZ(-110px)",
            }}
          />
        ))}
        <div style={{ position: "absolute", inset: 0, transform: "translateZ(24px)" }}>{children}</div>
      </div>
    </div>
  );
}

/**
 * Subtle 3D lift on hover. No sheen, no glow — the card rotates a couple of
 * degrees and its rule goes blue. That's it.
 */
export function Tilt({ children, max = 3, lift = 8, enabled = true, style = {} }) {
  const ref = useRef(null);
  const [t, setT] = useState({ rx: 0, ry: 0, on: false });

  const onMove = useCallback(
    (e) => {
      if (!enabled || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      setT({ rx: (0.5 - py) * max * 2, ry: (px - 0.5) * max * 2, on: true });
    },
    [enabled, max]
  );

  return (
    <div style={{ perspective: "1200px", ...style }}>
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => setT({ rx: 0, ry: 0, on: false })}
        style={{
          transformStyle: "preserve-3d",
          transform: enabled ? `rotateX(${t.rx}deg) rotateY(${t.ry}deg) translateZ(${t.on ? lift : 0}px)` : "none",
          transition: t.on ? "transform 0.15s ease-out" : "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Scroll reveal — a short rise and a wipe. Deliberately understated. */
export function Reveal({ children, delay = 0, distance = 18, style = {} }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : `translate3d(0, ${distance}px, 0)`,
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
        willChange: "transform, opacity",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** A hairline that draws itself left-to-right when it enters view. */
export function DrawRule({ delay = 0, colour = T.line2 }) {
  const [ref, inView] = useInView(0.2);
  return (
    <div ref={ref} style={{ height: "1px", background: T.line, overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          background: colour,
          transformOrigin: "left",
          transform: inView ? "scaleX(1)" : "scaleX(0)",
          transition: `transform 0.9s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
        }}
      />
    </div>
  );
}

/* ─── SECTION FURNITURE ───────────────────────────────────── */

/**
 * Section shell. A faint ruled backplane sits behind the content and drifts
 * against the scroll — the depth cue, kept structural rather than decorative.
 */
export function Scene({ id, index, mobile, pointer, children, background = T.ink, rules = true, style = {} }) {
  const [ref, progress] = useSectionProgress();
  return (
    <section
      id={id}
      ref={ref}
      style={{
        position: "relative",
        padding: mobile ? "4.5rem 1.35rem" : "7rem 3rem",
        background,
        borderTop: `1px solid ${T.line}`,
        overflow: "hidden",
        ...style,
      }}
    >
      {rules && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-12% -6%",
            pointerEvents: "none",
            backgroundImage: `linear-gradient(90deg, ${T.line} 1px, transparent 1px)`,
            backgroundSize: mobile ? "60px 100%" : "104px 100%",
            opacity: 0.55,
            transform: `translate3d(${pointer.x * -9 + progress * 14}px, 0, 0)`,
            willChange: "transform",
            maskImage: "linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent)",
          }}
        />
      )}
      <div style={{ maxWidth: "1180px", margin: "0 auto", position: "relative", zIndex: 1 }}>{children}</div>
    </section>
  );
}

/** `04 / EXPERIENCE ──────────────── 3 current` */
export function SectionHead({ index, title, note, mobile }) {
  return (
    <Reveal>
      <div style={{ marginBottom: mobile ? "2.2rem" : "3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.85rem" }}>
          <span style={{ ...TYPE.label, color: T.blue }}>{index}</span>
          <span style={{ ...TYPE.label, color: T.white }}>{title}</span>
          <span style={{ flex: 1 }} />
          {note && <span style={{ ...TYPE.meta, color: T.greyDim, whiteSpace: "nowrap" }}>{note}</span>}
        </div>
        <DrawRule />
      </div>
    </Reveal>
  );
}

/** Small squared-off marker used in place of glowing dots. */
export function Marker({ active = false, size = 6 }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        flexShrink: 0,
        background: active ? T.blue : "transparent",
        border: active ? "none" : `1px solid ${T.line3}`,
      }}
    />
  );
}
