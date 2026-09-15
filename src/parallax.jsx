import { useRef } from "react";
import { T, GLASS, EASE, TYPE, blueA, whiteA } from "./theme.js";
import { Reveal, DrawRule, Scramble, useInView } from "./motion.jsx";

/* ─────────────────────────────────────────────────────────
   SCENE FURNITURE

   Everything here positions itself off the motion engine's CSS
   variables (--sy, --sv, --mx, --my), so none of it re-renders
   while you scroll.
   ───────────────────────────────────────────────────────── */

/** Depth plane. `d` is how near it sits — higher moves further. */
export function Layer({ d = 1, style = {}, children }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        pointerEvents: "none",
        willChange: "transform",
        transform: `translate3d(calc(var(--mx) * ${-17 * d}px), calc(var(--sy) * ${0.055 * d}px + var(--my) * ${-12 * d}px), 0)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Nested hairline frames rotating as one rigid body toward the pointer,
 * with a frosted pane at the front. The page's main 3D object — it reads
 * as a construction drawing that happens to be made of glass.
 */
export function DepthFrames({ size = 260, children }) {
  const frames = [
    { z: -230, inset: -46, colour: whiteA(0.05), dash: true },
    { z: -160, inset: -30, colour: whiteA(0.07), dash: false },
    { z: -90,  inset: -15, colour: whiteA(0.10), dash: false },
  ];

  return (
    <div style={{ perspective: "1500px", width: size, height: size, position: "relative" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: "rotateX(calc(var(--my) * -8deg)) rotateY(calc(var(--mx) * 11deg))",
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

        {/* corner ticks, floating between the frames */}
        {[["t", "l"], ["t", "r"], ["b", "l"], ["b", "r"]].map(([v, h]) => (
          <span
            key={`${v}${h}`}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: v === "t" ? -30 : "auto",
              bottom: v === "b" ? -30 : "auto",
              left: h === "l" ? -30 : "auto",
              right: h === "r" ? -30 : "auto",
              width: 10, height: 10,
              borderTop: v === "t" ? `1px solid ${T.blue}` : "none",
              borderBottom: v === "b" ? `1px solid ${T.blue}` : "none",
              borderLeft: h === "l" ? `1px solid ${T.blue}` : "none",
              borderRight: h === "r" ? `1px solid ${T.blue}` : "none",
              transform: "translateZ(-160px)",
            }}
          />
        ))}

        {/* a loose pane drifting off-axis, to break the symmetry */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", top: "-16%", right: "-28%", width: "46%", height: "38%",
            ...GLASS.panel,
            background: `linear-gradient(150deg, ${whiteA(0.06)}, ${whiteA(0.01)})`,
            transform: "translateZ(90px) rotate(-8deg)",
            animation: "shardFloat 9s ease-in-out infinite",
          }}
        />

        <div style={{ position: "absolute", inset: 0, transform: "translateZ(40px)" }}>{children}</div>
      </div>
    </div>
  );
}

/**
 * Section shell. A ruled backplane drifts against the scroll, and the whole
 * block takes a small velocity-driven skew — the cue that sells momentum.
 */
export function Scene({ id, mobile, children, background = T.ink, rules = true, skew = true, style = {} }) {
  return (
    <section
      id={id}
      style={{
        position: "relative",
        padding: mobile ? "5rem 1.35rem" : "8rem 3rem",
        background,
        borderTop: `1px solid ${T.line}`,
        overflow: "hidden",
        zIndex: 1,
        ...style,
      }}
    >
      {rules && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-14% -8%",
            pointerEvents: "none",
            backgroundImage:
              `linear-gradient(90deg, ${T.line} 1px, transparent 1px),` +
              `linear-gradient(${whiteA(0.016)} 1px, transparent 1px)`,
            backgroundSize: mobile ? "60px 100%, 100% 60px" : "104px 100%, 100% 104px",
            opacity: 0.6,
            transform: `translate3d(calc(var(--mx) * -10px), calc(var(--sy) * -0.02px), 0)`,
            willChange: "transform",
            maskImage: "linear-gradient(to bottom, transparent, #000 16%, #000 84%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 16%, #000 84%, transparent)",
          }}
        />
      )}
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
          transform: skew ? "skewY(calc(var(--sv) * 0.5deg))" : undefined,
          willChange: skew ? "transform" : undefined,
        }}
      >
        {children}
      </div>
    </section>
  );
}

/** `04 / SELECTED WORK ─────────────── 15 projects` */
export function SectionHead({ index, title, note, mobile, motion = true }) {
  return (
    <Reveal>
      <div style={{ marginBottom: mobile ? "2.2rem" : "3.2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.9rem" }}>
          <span style={{ ...TYPE.label, color: T.blue }}>
            <Scramble text={index} enabled={motion} />
          </span>
          <span style={{ ...TYPE.label, color: T.white }}>
            <Scramble text={title.toUpperCase()} enabled={motion} delay={0.08} />
          </span>
          <span style={{ flex: 1 }} />
          {note && <span style={{ ...TYPE.meta, color: T.greyDim, whiteSpace: "nowrap" }}>{note}</span>}
        </div>
        <DrawRule />
      </div>
    </Reveal>
  );
}

/** Small squared marker — used instead of glowing dots. */
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
        boxShadow: active ? `0 0 0 3px ${blueA(0.15)}` : "none",
      }}
    />
  );
}

/**
 * Scroll-velocity marquee. Sits between sections and slides further the
 * faster you scroll, so the page has something that visibly reacts to input.
 */
export function Marquee({ items, mobile }) {
  const row = [...items, ...items, ...items];
  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        borderTop: `1px solid ${T.line}`,
        borderBottom: `1px solid ${T.line}`,
        padding: mobile ? "0.7rem 0" : "0.9rem 0",
        overflow: "hidden",
        background: T.paper,
        zIndex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: mobile ? "1.6rem" : "2.6rem",
          whiteSpace: "nowrap",
          width: "max-content",
          animation: `marquee ${mobile ? 34 : 46}s linear infinite`,
          transform: "translate3d(calc(var(--sv) * 90px), 0, 0)",
          willChange: "transform",
        }}
      >
        {row.map((t, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: mobile ? "1.6rem" : "2.6rem" }}>
            <span style={{ ...TYPE.label, fontSize: mobile ? "0.58rem" : "0.64rem", color: i % 3 === 0 ? T.blueLit : T.greyDim }}>{t}</span>
            <span style={{ width: 4, height: 4, background: T.line3, flexShrink: 0 }} />
          </span>
        ))}
      </div>
    </div>
  );
}

export { Reveal, DrawRule, useInView };
