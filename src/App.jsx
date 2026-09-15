import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import { PHOTO_B64, CERT_IMAGES } from "./assets.js";
import { T, FONT, TYPE, GLASS, EASE, blueA, whiteA } from "./theme.js";
import {
  NAV_LINKS, CONTACT_LINKS, EXPERIENCE, SKILL_BARS, PROJECTS, PROJECT_FILTERS,
  CERTS, ACHIEVEMENTS, INTERESTS, PHILOSOPHY, GOALS,
} from "./data.js";
import {
  useMotionEngine, useScrolled, useReducedMotion, useIsMobile, useInView,
  Cursor, SplitText, Scramble, Magnetic, Glass, Reveal, Grain, Aurora, Shards, Intro,
  ScrubIn, ScrubShift, useScrollDirection, BorderBeam, Counter, useHoverDecode,
} from "./motion.jsx";
import { Wireframe } from "./canvas3d.jsx";
import { Layer, DepthFrames, Scene, SectionHead, Marker, Marquee } from "./parallax.jsx";

/* ─── SEGMENTED METER ─────────────────────────────────────
   Reads as an instrument. Cells light in sequence from the left. */
function Meter({ name, level, delay }) {
  const [ref, inView] = useInView(0.12);
  const cells = 22;
  const filled = Math.round((level / 100) * cells);

  return (
    <div ref={ref} style={{ display: "flex", alignItems: "center", gap: "0.9rem", padding: "0.42rem 0" }}>
      <span style={{ ...TYPE.body, color: T.white, fontSize: "0.83rem", flex: "0 0 auto", minWidth: "8.6rem" }}>{name}</span>
      <span style={{ display: "flex", gap: "2px", flex: 1, minWidth: 0 }}>
        {Array.from({ length: cells }, (_, i) => {
          const on = inView && i < filled;
          return (
            <span
              key={i}
              style={{
                flex: 1, height: "10px", minWidth: "2px",
                background: on ? T.blue : whiteA(0.055),
                boxShadow: on ? `0 0 10px -2px ${blueA(0.8)}` : "none",
                transform: on ? "scaleY(1)" : "scaleY(0.45)",
                opacity: on ? 1 - (i / cells) * 0.32 : 1,
                transition: `background 0.4s ${EASE.out} ${delay + i * 0.022}s, transform 0.4s ${EASE.spring} ${delay + i * 0.022}s, box-shadow 0.4s ease ${delay + i * 0.022}s, opacity 0.4s ease ${delay + i * 0.022}s`,
              }}
            />
          );
        })}
      </span>
      <span style={{ ...TYPE.meta, color: T.greyDim, flex: "0 0 auto", width: "1.8rem", textAlign: "right" }}>
        <Counter value={level} />
      </span>
    </div>
  );
}

/* ─── PROJECT MARK ────────────────────────────────────────
   Deterministic blueprint glyph per project — same wireframe
   language as the hero canvas, seeded so each project keeps its own
   mark. When `draw` flips true the strokes paint themselves on. */
function ProjectMark({ seed, size = 96, draw = true }) {
  const pts = useMemo(() => {
    let a = (seed * 9301 + 49297) % 233280;
    const rnd = () => { a = (a * 9301 + 49297) % 233280; return a / 233280; };
    const n = 5 + Math.floor(rnd() * 3);
    return Array.from({ length: n }, (_, i) => {
      const ang = (i / n) * Math.PI * 2 + rnd() * 0.5;
      const rad = 0.3 + rnd() * 0.62;
      return [50 + Math.cos(ang) * rad * 42, 50 + Math.sin(ang) * rad * 42];
    });
  }, [seed]);

  const poly = pts.map((q) => q.join(",")).join(" ");
  const on = draw;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
      <circle
        cx="50" cy="50" r="46" fill="none" stroke={blueA(0.2)} strokeWidth="0.5" strokeDasharray="2 3"
        style={{ transformOrigin: "50% 50%", animation: on ? "markSpin 26s linear infinite" : "none" }}
      />
      <circle
        cx="50" cy="50" r="30" fill="none" stroke={blueA(0.16)} strokeWidth="0.5"
        strokeDasharray="189" strokeDashoffset={on ? 0 : 189}
        style={{ transition: `stroke-dashoffset 1.1s ${EASE.out} 0.1s` }}
      />
      <polygon
        points={poly} fill={blueA(0.07)} stroke={T.blueLit} strokeWidth="0.9" strokeLinejoin="round"
        strokeDasharray="300" strokeDashoffset={on ? 0 : 300}
        style={{
          transition: `stroke-dashoffset 1.3s ${EASE.out} 0.16s, fill-opacity 0.8s ease 0.7s`,
          fillOpacity: on ? 1 : 0,
        }}
      />
      {pts.map((q, i) => (
        <g key={i}>
          <line
            x1="50" y1="50" x2={q[0]} y2={q[1]} stroke={blueA(0.32)} strokeWidth="0.4"
            strokeDasharray="60" strokeDashoffset={on ? 0 : 60}
            style={{ transition: `stroke-dashoffset 0.75s ${EASE.out} ${0.3 + i * 0.07}s` }}
          />
          <rect
            x={q[0] - 1.6} y={q[1] - 1.6} width="3.2" height="3.2" fill={T.blueLit}
            style={{
              transformBox: "fill-box", transformOrigin: "center",
              transform: on ? "scale(1)" : "scale(0)",
              transition: `transform 0.5s ${EASE.spring} ${0.5 + i * 0.07}s`,
            }}
          />
        </g>
      ))}
      <rect x="48.6" y="48.6" width="2.8" height="2.8" fill={T.white} />
    </svg>
  );
}

/* ─── PROJECT ROW ─────────────────────────────────────────
   List row. Hovering one row displaces its neighbours and dims
   them, a light sweeps across it, and the name decodes out of
   noise. Opening slides a frosted pane out with the mark drawing
   itself in the rail. */
function ProjectRow({ project, mobile, motion, index, activeIndex, onHover, isOpen, onToggle }) {
  const hover = activeIndex === index;
  const lit = hover || isOpen;
  const name = useHoverDecode(project.name, hover && !isOpen, { enabled: motion });

  // fisheye: neighbours are pushed away and faded, nearest pushed most
  const dist = activeIndex === null || isOpen ? 0 : Math.abs(index - activeIndex);
  const push = dist === 0 ? 0 : Math.sign(index - activeIndex) * Math.max(0, 9 - dist * 2.6);
  const dim = dist === 0 ? 1 : Math.max(0.42, 1 - dist * 0.16);

  const cols = mobile
    ? "2.6rem 1fr 1.4rem"
    : "3.6rem minmax(0,1.15fr) minmax(0,0.95fr) minmax(0,0.95fr) 7rem 1.6rem";

  return (
    <div
      onMouseEnter={() => onHover?.(index)}
      onMouseLeave={() => onHover?.(null)}
      style={{
        position: "relative",
        borderBottom: `1px solid ${lit ? whiteA(0.15) : T.line}`,
        transform: motion ? `translateY(${push}px)` : "none",
        opacity: dim,
        transition: `transform 0.55s ${EASE.out}, opacity 0.45s ease, border-color 0.45s ${EASE.out}`,
        zIndex: lit ? 2 : 1,
      }}
    >
      {/* glass wash */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `linear-gradient(90deg, ${whiteA(0.07)} 0%, ${blueA(0.06)} 42%, transparent 100%)`,
          backdropFilter: lit ? "blur(10px)" : "none",
          WebkitBackdropFilter: lit ? "blur(10px)" : "none",
          transformOrigin: "left",
          transform: lit ? "scaleX(1)" : "scaleX(0)",
          opacity: lit ? 1 : 0,
          transition: `transform 0.7s ${EASE.out}, opacity 0.45s ease`,
        }}
      />

      {/* scan line sweeping the row */}
      {motion && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute", top: 0, bottom: 0, width: "72px", pointerEvents: "none",
            background: `linear-gradient(90deg, transparent, ${blueA(0.5)} 45%, ${whiteA(0.5)} 50%, ${blueA(0.5)} 55%, transparent)`,
            filter: "blur(0.4px)",
            opacity: hover && !isOpen ? 1 : 0,
            left: hover && !isOpen ? "calc(100% - 72px)" : "-72px",
            transition: hover && !isOpen
              ? `left 0.85s ${EASE.out}, opacity 0.2s ease`
              : "opacity 0.35s ease, left 0s linear 0.35s",
          }}
        />
      )}

      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        data-cursor={mobile ? undefined : "expand"}
        data-cursor-label={isOpen ? "CLOSE" : "OPEN"}
        style={{
          position: "relative", width: "100%", background: "none", border: "none", cursor: "pointer",
          color: "inherit", font: "inherit", textAlign: "left",
          display: "grid", gridTemplateColumns: cols,
          alignItems: "center", gap: mobile ? "0.8rem" : "1.5rem",
          paddingTop: mobile ? "1.05rem" : "1.4rem",
          paddingBottom: mobile ? "1.05rem" : "1.4rem",
          paddingRight: mobile ? "0.5rem" : "1rem",
          paddingLeft: mobile ? "0.5rem" : lit ? "1.9rem" : "1rem",
          transition: `padding-left 0.65s ${EASE.out}`,
        }}
      >
        <span
          style={{
            fontFamily: FONT.sans, fontWeight: 700,
            fontSize: mobile ? "1.15rem" : "1.75rem", lineHeight: 1, letterSpacing: "-0.04em",
            color: lit ? T.blue : "transparent",
            WebkitTextStroke: lit ? "0px" : `1px ${T.line3}`,
            textShadow: lit ? `0 0 22px ${blueA(0.7)}` : "none",
            transition: "color 0.35s ease, text-shadow 0.35s ease",
          }}
        >
          {project.id}
        </span>

        <span style={{ minWidth: 0, display: "block", overflow: "hidden" }}>
          <span
            style={{
              fontFamily: FONT.sans, fontWeight: 600,
              fontSize: mobile ? "1.05rem" : "1.55rem", letterSpacing: "-0.03em", lineHeight: 1.12,
              color: T.white, display: "block",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              transform: lit && !mobile ? "translateX(7px)" : "none",
              transition: `transform 0.6s ${EASE.out}`,
            }}
          >
            {name}
          </span>
          {mobile && (
            <span style={{ ...TYPE.meta, display: "block", marginTop: "0.3rem", fontSize: "0.6rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {project.tag}
            </span>
          )}
        </span>

        {!mobile && (
          <span style={{ ...TYPE.meta, fontSize: "0.68rem", color: lit ? T.grey : T.greyDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "color 0.35s ease" }}>
            {project.tag}
          </span>
        )}

        {/* stack chips cascade up on hover */}
        {!mobile && (
          <span style={{ display: "flex", gap: "0.3rem", alignItems: "center", minWidth: 0 }}>
            {project.stack.slice(0, 2).map((t, i) => (
              <span
                key={t}
                style={{
                  ...TYPE.meta, fontSize: "0.58rem", color: lit ? T.white : T.grey,
                  ...GLASS.chip, padding: "0.15rem 0.42rem", whiteSpace: "nowrap",
                  transform: lit ? "translateY(0)" : "translateY(0)",
                  borderColor: lit ? whiteA(0.2) : whiteA(0.07),
                  transition: `color 0.35s ease ${i * 0.05}s, border-color 0.35s ease ${i * 0.05}s`,
                }}
              >
                {t}
              </span>
            ))}
            {project.stack.length > 2 && (
              <span style={{ ...TYPE.meta, fontSize: "0.58rem", color: lit ? T.blueLit : T.faint, whiteSpace: "nowrap", transition: "color 0.35s ease" }}>
                +{project.stack.length - 2}
              </span>
            )}
          </span>
        )}

        {!mobile && (
          <span style={{ ...TYPE.label, fontSize: "0.52rem", color: project.org ? (lit ? T.grey : T.greyDim) : T.faint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "color 0.35s ease" }}>
            {project.org || project.repoLabel}
          </span>
        )}

        <span
          style={{
            ...TYPE.meta, color: lit ? T.blue : T.greyDim, fontSize: "0.95rem", lineHeight: 1,
            justifySelf: "end",
            transform: isOpen ? "rotate(135deg)" : lit ? "rotate(90deg)" : "none",
            transition: `transform 0.6s ${EASE.spring}, color 0.3s ease`,
          }}
        >
          +
        </span>
      </button>

      <div style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr", transition: `grid-template-rows 0.75s ${EASE.out}` }}>
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              position: "relative",
              margin: mobile ? "0 0.4rem 1.1rem" : "0 1rem 1.6rem 4.6rem",
              padding: mobile ? "1.1rem" : "1.6rem 1.8rem",
              ...GLASS.panel,
              display: "grid",
              gridTemplateColumns: mobile ? "1fr" : "auto 1fr 1fr",
              gap: mobile ? "1.3rem" : "1.7rem 2.4rem",
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? "translateY(0)" : "translateY(-12px)",
              transition: `opacity 0.5s ease ${isOpen ? "0.16s" : "0s"}, transform 0.6s ${EASE.out} ${isOpen ? "0.12s" : "0s"}`,
            }}
          >
            <BorderBeam active={isOpen && motion} duration={4.2} />

            {!mobile && (
              <div style={{ gridRow: "span 2", paddingRight: "1.1rem", borderRight: `1px solid ${whiteA(0.06)}` }}>
                <ProjectMark seed={Number(project.id)} size={108} draw={isOpen} />
                <div style={{ ...TYPE.label, fontSize: "0.5rem", color: T.faint, marginTop: "0.8rem" }}>{project.cat}</div>
              </div>
            )}

            {[["Problem", project.problem], ["Design", project.highlight], ["Outcome", project.power]].map(([k, v], i) => (
              <div
                key={k}
                style={{
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? "translateY(0)" : "translateY(10px)",
                  transition: `opacity 0.6s ease ${0.2 + i * 0.07}s, transform 0.7s ${EASE.out} ${0.2 + i * 0.07}s`,
                }}
              >
                <div style={{ ...TYPE.label, fontSize: "0.55rem", color: T.blueLit, marginBottom: "0.55rem" }}>{k}</div>
                <p style={{ ...TYPE.body, fontSize: "0.855rem", margin: 0 }}>{v}</p>
              </div>
            ))}

            <div
              style={{
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? "translateY(0)" : "translateY(10px)",
                transition: `opacity 0.6s ease 0.41s, transform 0.7s ${EASE.out} 0.41s`,
              }}
            >
              <div style={{ ...TYPE.label, fontSize: "0.55rem", color: T.blueLit, marginBottom: "0.6rem" }}>Stack</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem 0.5rem" }}>
                {project.stack.map((t, i) => (
                  <span
                    key={t}
                    style={{
                      ...TYPE.meta, fontSize: "0.63rem", color: T.grey, ...GLASS.chip, padding: "0.18rem 0.5rem",
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? "translateY(0) scale(1)" : "translateY(8px) scale(0.92)",
                      transition: `opacity 0.4s ease ${0.46 + i * 0.045}s, transform 0.55s ${EASE.spring} ${0.46 + i * 0.045}s`,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: "1.2rem" }}>
                {project.repo ? (
                  <Magnetic enabled={!mobile} strength={0.22}>
                    <a
                      href={project.repo} target="_blank" rel="noopener noreferrer"
                      data-cursor={mobile ? undefined : "link"} data-cursor-label="VISIT"
                      style={{ ...TYPE.label, fontSize: "0.58rem", color: T.blueLit, textDecoration: "none", borderBottom: `1px solid ${T.blueDim}`, paddingBottom: "0.2rem", transition: "border-color 0.3s, color 0.3s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.blue; e.currentTarget.style.color = T.white; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.blueDim; e.currentTarget.style.color = T.blueLit; }}
                    >
                      {project.repoLabel} ↗
                    </a>
                  </Magnetic>
                ) : (
                  <span style={{ ...TYPE.label, fontSize: "0.58rem", color: T.faint }}>{project.repoLabel}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── HOVER PREVIEW ───────────────────────────────────────
   Frosted tile trailing the cursor across the list. Lerped in its
   own rAF loop, so the list never re-renders on mouse move. */
function ProjectPreview({ project }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, seeded = false;
    const onMove = (e) => {
      tx = e.clientX + 28;
      ty = e.clientY - 158;
      if (!seeded) { cx = tx; cy = ty; seeded = true; }
    };
    const tick = () => {
      cx += (tx - cx) * 0.13;
      cy += (ty - cy) * 0.13;
      // lean into the direction of travel
      const lean = Math.max(-9, Math.min(9, (tx - cx) * 0.35));
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) rotate(${lean.toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed", top: 0, left: 0, zIndex: 900, pointerEvents: "none",
        width: 228, padding: "1rem", ...GLASS.panelLit,
        opacity: project ? 1 : 0,
        scale: project ? "1" : "0.88",
        transition: `opacity 0.35s ease, scale 0.5s ${EASE.spring}`,
        willChange: "transform",
      }}
    >
      <BorderBeam active={!!project} duration={3} />
      {project && (
        <>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.8rem" }}>
            <ProjectMark seed={Number(project.id)} size={94} draw />
          </div>
          <div style={{ ...TYPE.label, fontSize: "0.5rem", color: T.blueLit, marginBottom: "0.35rem" }}>{project.cat}</div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: "0.95rem", letterSpacing: "-0.02em", color: T.white, marginBottom: "0.3rem" }}>
            {project.name}
          </div>
          <div style={{ ...TYPE.meta, fontSize: "0.6rem", color: T.greyDim, lineHeight: 1.5 }}>{project.tag}</div>
          <div style={{ marginTop: "0.75rem", paddingTop: "0.6rem", borderTop: `1px solid ${whiteA(0.07)}`, display: "flex", justifyContent: "space-between" }}>
            <span style={{ ...TYPE.meta, fontSize: "0.55rem", color: T.faint }}>{project.stack.length} technologies</span>
            <span style={{ ...TYPE.meta, fontSize: "0.55rem", color: T.blue }}>{project.id}</span>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── EXPERIENCE ENTRY ────────────────────────────────────── */
function Role({ job, mobile, motion }) {
  return (
    <Glass
      enabled={motion}
      tilt={motion ? 2.2 : 0}
      beam
      depth={20}
      style={{ padding: mobile ? "1.2rem" : "1.6rem 1.8rem", marginBottom: "0.85rem" }}
    >
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "minmax(0,12rem) 1fr", gap: mobile ? "0.85rem" : "2.6rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.55rem" }}>
            <Marker active={job.current && !job.contract} />
            <span style={{ ...TYPE.meta, color: job.current ? T.blueLit : T.greyDim, fontSize: "0.63rem" }}>
              {job.current ? (job.contract ? "CONTRACT" : "CURRENT") : job.period}
            </span>
          </div>
          <h3 style={{ ...TYPE.h3(mobile), margin: 0 }}>{job.company}</h3>
        </div>

        <div>
          <div style={{ ...TYPE.label, fontSize: "0.58rem", color: T.blueLit, marginBottom: "0.7rem" }}>{job.role}</div>
          <p style={{ ...TYPE.body, margin: "0 0 1rem", maxWidth: "60ch" }}>{job.summary}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem 0.45rem" }}>
            {job.stack.map((s) => (
              <span key={s} style={{ ...TYPE.meta, fontSize: "0.62rem", color: T.grey, ...GLASS.chip, padding: "0.16rem 0.48rem" }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </Glass>
  );
}

/* ─── CERT ────────────────────────────────────────────────── */
function Cert({ cert, mobile, motion }) {
  const [open, setOpen] = useState(false);
  return (
    <Glass enabled={motion} beam style={{ marginBottom: "0.7rem", overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        data-cursor={mobile ? undefined : "expand"}
        data-cursor-label={open ? "CLOSE" : "VIEW"}
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", color: "inherit", font: "inherit", textAlign: "left", padding: mobile ? "1rem 1.1rem" : "1.1rem 1.3rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}
      >
        <span>
          <span style={{ ...TYPE.label, fontSize: "0.55rem", color: T.blueLit, display: "block", marginBottom: "0.4rem" }}>{cert.issuer}</span>
          <span style={{ ...TYPE.body, color: T.white, display: "block", fontSize: "0.9rem" }}>{cert.name}</span>
          <span style={{ ...TYPE.meta, fontSize: "0.63rem", display: "block", marginTop: "0.2rem" }}>{cert.full}</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.7rem", flexShrink: 0 }}>
          <span style={{ ...TYPE.meta, fontSize: "0.62rem", whiteSpace: "nowrap" }}>{cert.date}</span>
          <span style={{ ...TYPE.meta, color: open ? T.blue : T.greyDim, fontSize: "0.9rem", lineHeight: 1, transform: open ? "rotate(135deg)" : "none", transition: `transform 0.6s ${EASE.spring}, color 0.25s`, display: "inline-block" }}>+</span>
        </span>
      </button>

      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: `grid-template-rows 0.7s ${EASE.out}` }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ padding: mobile ? "0 1.1rem 1.1rem" : "0 1.3rem 1.3rem" }}>
            <div style={{ overflow: "hidden", border: `1px solid ${whiteA(0.09)}`, marginBottom: "0.9rem" }}>
              <img
                src={CERT_IMAGES[cert.img]} alt={cert.name} loading="lazy"
                style={{
                  width: "100%", display: "block",
                  transform: open ? "scale(1)" : "scale(1.08)",
                  transition: `transform 1.1s ${EASE.out}`,
                }}
              />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.4rem" }}>
              {cert.valid && (
                <span>
                  <span style={{ ...TYPE.label, fontSize: "0.52rem", color: T.faint, display: "block", marginBottom: "0.22rem" }}>Validity</span>
                  <span style={{ ...TYPE.meta, color: T.grey, fontSize: "0.68rem" }}>{cert.valid}</span>
                </span>
              )}
              {cert.id && (
                <span>
                  <span style={{ ...TYPE.label, fontSize: "0.52rem", color: T.faint, display: "block", marginBottom: "0.22rem" }}>ID</span>
                  <span style={{ ...TYPE.meta, color: T.grey, fontSize: "0.68rem" }}>{cert.id}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Glass>
  );
}

/* ─── MAIN ────────────────────────────────────────────────── */
export default function Portfolio() {
  const mobile = useIsMobile();
  const wide = !useIsMobile(1180);
  const reduced = useReducedMotion();
  const motion = !mobile && !reduced;

  useMotionEngine(!reduced);

  const scrolled = useScrolled(30);
  const dir = useScrollDirection();
  const [navOpen, setNavOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [hoverRow, setHoverRow] = useState(null);
  const [openRow, setOpenRow] = useState(null);
  const [clock, setClock] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tick = () =>
      setClock(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata", hour12: false }).format(new Date()));
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, []);

  const scrollTo = useCallback((id) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    setNavOpen(false);
  }, [reduced]);

  const visibleProjects = useMemo(
    () => (filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.cat === filter)),
    [filter]
  );

  const skillGroups = useMemo(() => {
    const map = new Map();
    for (const s of SKILL_BARS) {
      if (!map.has(s.cat)) map.set(s.cat, []);
      map.get(s.cat).push(s);
    }
    return [...map.entries()];
  }, []);

  const introOn = !reduced;
  const heroReady = ready || !introOn;

  return (
    <div style={{ background: T.ink, color: T.white, minHeight: "100vh", fontFamily: FONT.sans, overflowX: "hidden", position: "relative" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;--sy:0;--sv:0;--mx:0;--my:0;--prog:0;}
        body{background:${T.ink};font-family:${FONT.sans};}
        ::selection{background:${T.blue};color:#fff;}
        ::-webkit-scrollbar{width:9px;}
        ::-webkit-scrollbar-track{background:${T.ink};}
        ::-webkit-scrollbar-thumb{background:${T.line2};border:3px solid ${T.ink};}
        ::-webkit-scrollbar-thumb:hover{background:${T.line3};}
        img{max-width:100%;}
        a,button{touch-action:manipulation;}
        button:focus-visible,a:focus-visible{outline:1px solid ${T.blue};outline-offset:3px;}
        h1,h2,h3{font-weight:inherit;}

        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes drop{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes marquee{from{transform:translate3d(0,0,0)}to{transform:translate3d(-33.333%,0,0)}}
        @keyframes auroraDrift{0%,100%{translate:0 0}33%{translate:4% -3%}66%{translate:-3% 3%}}
        @keyframes shardFloat{0%,100%{translate:0 0;rotate:0deg}50%{translate:0 -14px;rotate:1.2deg}}
        @keyframes grainShift{
          0%{transform:translate(0,0)}20%{transform:translate(-4%,3%)}40%{transform:translate(3%,-4%)}
          60%{transform:translate(-3%,-3%)}80%{transform:translate(4%,4%)}100%{transform:translate(0,0)}
        }
        @keyframes beamSpin{to{transform:translate(-50%,-50%) rotate(360deg)}}
        @keyframes markSpin{to{transform:rotate(360deg)}}
        @keyframes scrollCue{0%{transform:translateY(-110%)}60%,100%{transform:translateY(420%)}}

        @media (prefers-reduced-motion: reduce){
          *{animation-duration:0.001ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important;}
          html{scroll-behavior:auto;}
        }
      `}</style>

      <Intro enabled={introOn} onDone={() => setReady(true)} />
      <Cursor enabled={motion} />
      <Aurora mobile={mobile} />
      <Grain opacity={mobile ? 0.025 : 0.038} />

      {/* ── NAV ── */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
          padding: mobile ? "0.85rem 1.35rem" : "1rem 3rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          ...(scrolled || navOpen ? GLASS.bar : { background: "transparent", borderBottom: "1px solid transparent" }),
          // direction, not position: it gets out of the way while you read
          // downward and comes back the moment you scroll back up
          transform: scrolled && dir === "down" && !navOpen ? "translateY(-102%)" : "translateY(0)",
          transition:
            `transform 0.55s ${EASE.out}, background 0.5s ${EASE.out}, ` +
            `border-color 0.5s ease, backdrop-filter 0.5s ease, padding 0.5s ${EASE.out}`,
        }}
      >
        <button
          onClick={() => scrollTo("top")}
          data-cursor={motion ? "link" : undefined} data-cursor-label="TOP"
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "baseline", gap: "0.55rem", padding: 0 }}
        >
          <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: "0.92rem", letterSpacing: "-0.03em", color: T.white }}>Surya J</span>
          <span style={{ ...TYPE.meta, fontSize: "0.58rem", color: T.faint }}>/ DARX</span>
        </button>

        {mobile ? (
          <button
            onClick={() => setNavOpen(!navOpen)}
            aria-label={navOpen ? "Close menu" : "Open menu"} aria-expanded={navOpen}
            style={{ ...GLASS.chip, color: T.white, cursor: "pointer", minWidth: "44px", minHeight: "36px", ...TYPE.label, fontSize: "0.55rem" }}
          >
            {navOpen ? "CLOSE" : "MENU"}
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "1.35rem" }}>
            {NAV_LINKS.map((l) => (
              <Magnetic key={l} enabled={motion} strength={0.3}>
                <button
                  onClick={() => scrollTo(l)}
                  data-cursor={motion ? "link" : undefined}
                  style={{ background: "none", border: "none", ...TYPE.label, fontSize: "0.58rem", color: T.greyDim, padding: "0.4rem 0", cursor: "pointer", transition: "color 0.25s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = T.white)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = T.greyDim)}
                >
                  {l}
                </button>
              </Magnetic>
            ))}
            {wide && (
              <span style={{ ...TYPE.meta, fontSize: "0.58rem", color: T.faint, borderLeft: `1px solid ${T.line2}`, paddingLeft: "1.1rem" }}>
                IST {clock}
              </span>
            )}
          </div>
        )}

        <div aria-hidden="true" style={{ position: "absolute", left: 0, bottom: 0, height: "1px", width: "calc(var(--prog) * 100%)", background: `linear-gradient(90deg, ${T.blueDim}, ${T.blue})`, boxShadow: `0 0 12px ${blueA(0.7)}` }} />
      </nav>

      {mobile && navOpen && (
        <div style={{ position: "fixed", top: "52px", left: 0, right: 0, zIndex: 999, ...GLASS.bar, padding: "0 1.35rem 1.2rem", animation: "drop 0.25s ease" }}>
          {NAV_LINKS.map((l, i) => (
            <button
              key={l} onClick={() => scrollTo(l)}
              style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: `1px solid ${whiteA(0.06)}`, ...TYPE.label, fontSize: "0.66rem", color: T.grey, padding: "0.95rem 0", cursor: "pointer", minHeight: "46px", animation: `drop 0.4s ${EASE.out} ${i * 0.04}s both` }}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {/* ── HERO ── */}
      <section
        id="top"
        style={{
          minHeight: "100svh", display: "flex", alignItems: "center",
          padding: mobile ? "6.5rem 1.35rem 4rem" : "7rem 3rem 5rem",
          position: "relative", overflow: "hidden", zIndex: 1,
        }}
      >
        {/* ruled backplane, drifting */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", inset: "-12%", pointerEvents: "none",
            backgroundImage: `linear-gradient(90deg, ${T.line} 1px, transparent 1px), linear-gradient(${whiteA(0.016)} 1px, transparent 1px)`,
            backgroundSize: mobile ? "60px 100%, 100% 60px" : "104px 100%, 100% 104px",
            opacity: 0.65,
            transform: "translate3d(calc(var(--mx) * -12px), calc(var(--sy) * -0.03px), 0)",
            maskImage: "radial-gradient(ellipse at 40% 45%, #000 15%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(ellipse at 40% 45%, #000 15%, transparent 78%)",
            willChange: "transform",
          }}
        />

        {/* floating glass shards at four depths */}
        {!mobile && (
          <Shards
            items={[
              { top: "13%", left: "52%", w: 118, h: 150, r: -9,  d: 0.5, o: 0.85 },
              { top: "60%", left: "47%", w: 86,  h: 86,  r: 7,   d: 1.5, o: 0.7 },
              { top: "26%", right: "4%", w: 64,  h: 150, r: 4,   d: 2.2, o: 0.55 },
              { top: "74%", left: "6%",  w: 140, h: 62,  r: -4,  d: 1.1, o: 0.4 },
            ]}
          />
        )}

        {/* 3D wireframe solid, rendered on canvas and driven by scroll */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            right: mobile ? "-18%" : "-4%",
            width: mobile ? "128%" : "62%",
            zIndex: 0, pointerEvents: "none",
            opacity: mobile ? 0.5 : 0.95,
          }}
        >
          <Wireframe reduced={reduced} mobile={mobile} />
        </div>

        <Layer d={0.35} style={{ top: "12%", right: "6%" }}>
          <div style={{ width: mobile ? 280 : 560, height: mobile ? 280 : 560, background: `radial-gradient(circle, ${blueA(0.12)} 0%, transparent 62%)` }} />
        </Layer>

        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "1180px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "minmax(0,1.32fr) minmax(0,1fr)", gap: mobile ? "3rem" : "4rem", alignItems: "center" }}>
            <div>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: mobile ? "1.6rem" : "2.1rem",
                  opacity: heroReady ? 1 : 0, transform: heroReady ? "none" : "translateY(14px)",
                  transition: `opacity 0.8s ${EASE.out} 0.05s, transform 0.8s ${EASE.out} 0.05s`,
                }}
              >
                <span style={{ width: 5, height: 5, background: T.blue, boxShadow: `0 0 0 4px ${blueA(0.16)}`, animation: reduced ? "none" : "blink 2.6s ease-in-out infinite" }} />
                <span style={{ ...TYPE.label, fontSize: "0.57rem", color: T.grey }}>Available for work</span>
                <span style={{ width: "2.2rem", height: "1px", background: T.line2 }} />
                <span style={{ ...TYPE.meta, fontSize: "0.6rem", color: T.faint }}>Coimbatore, IN</span>
              </div>

              <h1 style={{ ...TYPE.display(mobile), marginBottom: mobile ? "1.3rem" : "1.6rem" }}>
                <SplitText enabled={!reduced} hold={!heroReady} delay={0.12} stagger={0.06}>App &amp; web</SplitText>
                <SplitText enabled={!reduced} hold={!heroReady} delay={0.2} stagger={0.06}>developer</SplitText>
                <span style={{ display: "block", overflow: "hidden" }}>
                  <span
                    style={{
                      display: "inline-block", color: T.greyDim,
                      transform: heroReady ? "translateY(0)" : "translateY(105%)",
                      transition: `transform 0.95s ${EASE.out} 0.3s`,
                    }}
                  >
                    building&nbsp;
                  </span>
                  <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}>
                    <span
                      style={{
                        display: "inline-block",
                        transform: heroReady ? "translateY(0)" : "translateY(105%)",
                        transition: `transform 0.95s ${EASE.out} 0.36s`,
                      }}
                    >
                      real systems
                    </span>
                  </span>
                </span>
              </h1>

              <Reveal delay={0.1}>
                <p style={{ ...TYPE.body, maxWidth: "48ch", marginBottom: mobile ? "2rem" : "2.4rem", fontSize: "0.94rem" }}>
                  I'm Surya — at <span style={{ color: T.white }}>Kosal Tech Solutions</span>, with a contract
                  engagement at <span style={{ color: T.white }}>Manju Global</span>. Android apps in Kotlin,
                  platforms in Next.js, and the Go and Python services underneath.
                </p>
              </Reveal>

              <Reveal delay={0.16}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.7rem", marginBottom: mobile ? "2.4rem" : "3rem" }}>
                  <Magnetic enabled={motion} strength={0.28}>
                    <a
                      href="/Surya_J_Resume.pdf" target="_blank" rel="noopener noreferrer"
                      data-cursor={motion ? "link" : undefined} data-cursor-label="OPEN"
                      style={{
                        ...TYPE.label, fontSize: "0.6rem", background: T.blue, color: "#fff", textDecoration: "none",
                        padding: "0.82rem 1.4rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", minHeight: "44px",
                        boxShadow: `0 16px 40px -18px ${blueA(1)}, inset 0 1px 0 ${whiteA(0.25)}`,
                        transition: `box-shadow 0.4s ${EASE.out}, background 0.3s ease`,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#1a4fe0"; e.currentTarget.style.boxShadow = `0 22px 52px -18px ${blueA(1)}, inset 0 1px 0 ${whiteA(0.3)}`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = T.blue; e.currentTarget.style.boxShadow = `0 16px 40px -18px ${blueA(1)}, inset 0 1px 0 ${whiteA(0.25)}`; }}
                    >
                      Resume <span aria-hidden="true">↓</span>
                    </a>
                  </Magnetic>

                  <Magnetic enabled={motion} strength={0.28}>
                    <button
                      onClick={() => scrollTo("work")}
                      data-cursor={motion ? "link" : undefined}
                      style={{ ...TYPE.label, fontSize: "0.6rem", ...GLASS.chip, color: T.grey, padding: "0.82rem 1.4rem", cursor: "pointer", minHeight: "44px", transition: "color 0.3s, border-color 0.3s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = T.white; e.currentTarget.style.borderColor = whiteA(0.2); }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = T.grey; e.currentTarget.style.borderColor = whiteA(0.07); }}
                    >
                      Selected work →
                    </button>
                  </Magnetic>
                </div>
              </Reveal>

              <Reveal delay={0.22}>
                <Glass enabled={motion} style={{ padding: mobile ? "0.3rem 0.9rem" : "0.4rem 1.2rem" }}>
                  {[
                    ["Currently", "Kosal Tech Solutions"],
                    ["Contract", "Manju Global"],
                    ["Studying", "B.E. CSE, DSCE Coimbatore — 2022/2026"],
                    ["Also", "Co-founder, Cruza"],
                  ].map(([k, v], i) => (
                    <div key={k} style={{ display: "grid", gridTemplateColumns: mobile ? "6.2rem 1fr" : "8rem 1fr", gap: "1rem", padding: "0.66rem 0", borderBottom: i < 2 ? `1px solid ${whiteA(0.05)}` : "none" }}>
                      <span style={{ ...TYPE.label, fontSize: "0.54rem", color: T.faint }}>{k}</span>
                      <span style={{ ...TYPE.meta, fontSize: "0.68rem", color: T.grey }}>{v}</span>
                    </div>
                  ))}
                </Glass>
              </Reveal>
            </div>

            {/* the 3D object */}
            {!mobile && (
              <div
                style={{
                  display: "flex", justifyContent: "center", alignItems: "center", padding: "3rem",
                  opacity: heroReady ? 1 : 0,
                  transform: heroReady ? "none" : "scale(0.94)",
                  transition: `opacity 1.1s ${EASE.out} 0.35s, transform 1.2s ${EASE.out} 0.35s`,
                }}
              >
                <DepthFrames size={252}>
                  <div
                    data-cursor="expand" data-cursor-label="DARX"
                    style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", ...GLASS.panelLit, padding: 0 }}
                  >
                    <img
                      src={PHOTO_B64} alt="Surya J"
                      style={{
                        width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block",
                        filter: "grayscale(1) contrast(1.1)",
                        transform: "scale(1.06) translate3d(calc(var(--mx) * 7px), calc(var(--my) * 7px), 0)",
                        willChange: "transform",
                      }}
                    />
                    <span aria-hidden="true" style={{ position: "absolute", inset: 0, background: blueA(0.16), mixBlendMode: "color" }} />
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute", left: 0, right: 0, bottom: 0, padding: "0.6rem 0.75rem",
                        background: "rgba(8,10,15,0.5)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
                        borderTop: `1px solid ${whiteA(0.1)}`, display: "flex", justifyContent: "space-between",
                      }}
                    >
                      <span style={{ ...TYPE.meta, fontSize: "0.55rem", color: T.grey }}>SURYA J</span>
                      <span style={{ ...TYPE.meta, fontSize: "0.55rem", color: T.blueLit }}>DARX</span>
                    </span>
                  </div>
                </DepthFrames>
              </div>
            )}
          </div>
        </div>

        {/* scroll cue */}
        {!mobile && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute", bottom: "1.6rem", left: "50%", transform: "translateX(-50%)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem", zIndex: 2,
              opacity: heroReady ? "calc(1 - var(--prog) * 14)" : 0,
              transition: `opacity 0.8s ${EASE.out} 1s`,
            }}
          >
            <span style={{ ...TYPE.label, fontSize: "0.48rem", color: T.faint }}>Scroll</span>
            <span style={{ width: "1px", height: "44px", background: T.line2, position: "relative", overflow: "hidden" }}>
              <span style={{ position: "absolute", inset: 0, height: "12px", background: T.blue, animation: reduced ? "none" : "scrollCue 2.6s ease-in-out infinite" }} />
            </span>
          </div>
        )}
      </section>

      <Marquee
        mobile={mobile}
        items={["Kotlin", "Jetpack Compose", "Next.js", "TypeScript", "Go", "PostGIS", "FastAPI", "Convex", "React", "Python", "Firebase", "Docker"]}
      />

      {/* ── 01 PROFILE ── */}
      <Scene id="about" mobile={mobile} background={T.paper}>
        <SectionHead index="01" title="Profile" mobile={mobile} motion={!reduced} />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "minmax(0,1.25fr) minmax(0,1fr)", gap: mobile ? "2.2rem" : "4rem" }}>
          <div>
            <SplitText
              as="h2"
              enabled={!reduced}
              stagger={0.04}
              style={{ ...TYPE.h2(mobile), marginBottom: "1.4rem", maxWidth: "22ch" }}
            >
              I build things that hold up outside the demo.
            </SplitText>
            <Reveal delay={0.08}>
              <p style={{ ...TYPE.body, marginBottom: "1.1rem", maxWidth: "58ch" }}>
                CSE student at DSCE Coimbatore, 2022–2026, and a working app and web developer. I'm at Kosal Tech
                Solutions, with a contract engagement at Manju Global — shipping Android clients, Next.js platforms,
                and the services behind them.
              </p>
              <p style={{ ...TYPE.body, color: T.greyDim, maxWidth: "58ch" }}>
                The approach is deliberate: understand the domain before writing code, then keep the architecture small
                enough that the next person can read it. I also co-founded Cruza, an independent studio building
                intelligent systems.
              </p>
            </Reveal>
          </div>

          <ScrubShift enabled={!reduced && !mobile} distance={-54} span={1.6}>
            <Glass enabled={motion} tilt={motion ? 2.4 : 0} beam depth={18} style={{ padding: mobile ? "0.4rem 1.1rem" : "0.5rem 1.4rem" }}>
              {[
                ["College", "DSCE, Coimbatore"],
                ["Degree", "B.E. Computer Science"],
                ["Batch", "2022 — 2026"],
                ["Based", "Coimbatore, Tamil Nadu"],
                ["Roles", "Kosal Tech · Manju Global (contract)"],
                ["Startup", "Cruza — Co-founder"],
              ].map(([k, v], i, arr) => (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "6.5rem 1fr", gap: "1rem", padding: "0.8rem 0", borderBottom: i < arr.length - 1 ? `1px solid ${whiteA(0.05)}` : "none" }}>
                  <span style={{ ...TYPE.label, fontSize: "0.54rem", color: T.faint }}>{k}</span>
                  <span style={{ ...TYPE.body, fontSize: "0.83rem", color: T.white }}>{v}</span>
                </div>
              ))}
            </Glass>
          </ScrubShift>
        </div>
      </Scene>

      {/* ── 02 EXPERIENCE ── */}
      <Scene id="experience" mobile={mobile} background={T.ink}>
        <SectionHead index="02" title="Experience" note={`${EXPERIENCE.filter((e) => e.current).length} active`} mobile={mobile} motion={!reduced} />
        {EXPERIENCE.map((job) => (
          <ScrubIn key={job.company} enabled={!reduced} lift={54} rotate={10} span={0.8}>
            <Role job={job} mobile={mobile} motion={motion} />
          </ScrubIn>
        ))}
      </Scene>

      {/* ── 03 STACK ── */}
      <Scene id="stack" mobile={mobile} background={T.paper}>
        <SectionHead index="03" title="Stack" note={`${SKILL_BARS.length} tracked`} mobile={mobile} motion={!reduced} />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? "1.4rem" : "1.6rem 3rem" }}>
          {skillGroups.map(([cat, items]) => (
            <ScrubIn key={cat} enabled={!reduced} lift={44} rotate={8} span={0.78}>
              <Glass enabled={motion} beam tilt={motion ? 1.4 : 0} depth={14} style={{ padding: mobile ? "1rem 1.1rem" : "1.1rem 1.4rem" }}>
                <div style={{ ...TYPE.label, fontSize: "0.54rem", color: T.blueLit, marginBottom: "0.7rem" }}>{cat}</div>
                {items.map((s, i) => (
                  <Meter key={s.name} name={s.name} level={s.level} delay={i * 0.06} />
                ))}
              </Glass>
            </ScrubIn>
          ))}
        </div>

        <div style={{ marginTop: "2.6rem", paddingTop: "1.8rem", borderTop: `1px solid ${T.line}` }}>
          <Reveal>
            <div style={{ ...TYPE.label, fontSize: "0.54rem", color: T.faint, marginBottom: "1rem" }}>Interests</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem 0.5rem" }}>
              {INTERESTS.map((t) => (
                <span
                  key={t}
                  style={{ ...TYPE.meta, fontSize: "0.66rem", color: T.grey, ...GLASS.chip, padding: "0.32rem 0.7rem", transition: `color 0.3s, border-color 0.3s, transform 0.5s ${EASE.spring}`, cursor: "default", display: "inline-block" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = T.white; e.currentTarget.style.borderColor = whiteA(0.22); e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = T.grey; e.currentTarget.style.borderColor = whiteA(0.07); e.currentTarget.style.transform = "none"; }}
                >
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </Scene>

      {/* ── 04 WORK ── */}
      <Scene id="work" mobile={mobile} background={T.ink}>
        <SectionHead index="04" title="Selected Work" note={`${PROJECTS.length} projects`} mobile={mobile} motion={!reduced} />

        <Reveal>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.4rem", marginBottom: "1.6rem" }}>
            {PROJECT_FILTERS.map((f) => {
              const active = filter === f;
              const count = f === "All" ? PROJECTS.length : PROJECTS.filter((p) => p.cat === f).length;
              return (
                <Magnetic key={f} enabled={motion} strength={0.24}>
                  <button
                    onClick={() => { setFilter(f); setHoverRow(null); setOpenRow(null); }}
                    data-cursor={motion ? "link" : undefined}
                    style={{
                      ...TYPE.label, fontSize: "0.57rem", background: "none", border: "none", cursor: "pointer",
                      color: active ? T.white : T.faint,
                      borderBottom: `1px solid ${active ? T.blue : "transparent"}`,
                      paddingBottom: "0.35rem", transition: `color 0.3s ease, border-color 0.4s ${EASE.out}`,
                    }}
                  >
                    {f}
                    <sup style={{ ...TYPE.meta, fontSize: "0.5rem", marginLeft: "0.25rem", color: active ? T.blue : T.faint }}>{count}</sup>
                  </button>
                </Magnetic>
              );
            })}
          </div>
        </Reveal>

        {/* column header — the thing that makes it read as a list, not cards */}
        {!mobile && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "3.6rem minmax(0,1.15fr) minmax(0,0.95fr) minmax(0,0.95fr) 7rem 1.6rem",
              gap: "1.5rem", padding: "0 1rem 0.7rem",
              borderBottom: `1px solid ${T.line2}`,
            }}
          >
            {["#", "Project", "Discipline", "Stack", "Owner", ""].map((h, i) => (
              <span key={i} style={{ ...TYPE.label, fontSize: "0.5rem", color: T.faint }}>{h}</span>
            ))}
          </div>
        )}

        <div style={{ borderTop: mobile ? `1px solid ${T.line2}` : "none" }}>
          {visibleProjects.map((p, i) => (
            <ScrubIn
              key={p.id}
              enabled={!reduced}
              lift={30}
              rotate={6}
              blur={3}
              shift={i % 2 === 0 ? -26 : 26}
              span={0.72}
            >
              <ProjectRow
                project={p}
                index={i}
                mobile={mobile}
                motion={motion}
                activeIndex={hoverRow}
                onHover={setHoverRow}
                isOpen={openRow === p.id}
                onToggle={() => setOpenRow(openRow === p.id ? null : p.id)}
              />
            </ScrubIn>
          ))}
        </div>

        {motion && (
          <ProjectPreview
            project={hoverRow === null || openRow !== null ? null : visibleProjects[hoverRow] || null}
          />
        )}
      </Scene>

      {/* ── 05 APPROACH ── */}
      <Scene id="approach" mobile={mobile} background={T.paper}>
        <SectionHead index="05" title="Approach" mobile={mobile} motion={!reduced} />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? "2.4rem" : "3rem" }}>
          {[["How I build", PHILOSOPHY], ["Where it's going", GOALS]].map(([label, items], col) => (
            <div key={label}>
              <Reveal delay={col * 0.08}>
                <div style={{ ...TYPE.label, fontSize: "0.54rem", color: T.blueLit, marginBottom: "1.1rem" }}>{label}</div>
              </Reveal>
              {items.map((p, i) => (
                <ScrubIn key={p.t} enabled={!reduced} lift={38} rotate={8} span={0.74}>
                  <Glass enabled={motion} beam tilt={motion ? 2 : 0} depth={16} style={{ padding: mobile ? "1rem 1.1rem" : "1.1rem 1.3rem", marginBottom: "0.7rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2.4rem 1fr", gap: "0.8rem" }}>
                      <span style={{ ...TYPE.meta, fontSize: "0.63rem", color: T.blue }}>{p.n}</span>
                      <span>
                        <span style={{ ...TYPE.body, color: T.white, display: "block", fontSize: "0.9rem", marginBottom: "0.32rem" }}>{p.t}</span>
                        <span style={{ ...TYPE.body, fontSize: "0.84rem", display: "block" }}>{p.b}</span>
                      </span>
                    </div>
                  </Glass>
                </ScrubIn>
              ))}
            </div>
          ))}
        </div>
      </Scene>

      {/* ── 06 CREDENTIALS ── */}
      <Scene id="credentials" mobile={mobile} background={T.ink}>
        <SectionHead index="06" title="Credentials" mobile={mobile} motion={!reduced} />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? "2.4rem" : "3rem" }}>
          <div>
            <Reveal>
              <div style={{ ...TYPE.label, fontSize: "0.54rem", color: T.blueLit, marginBottom: "1rem" }}>Certifications</div>
            </Reveal>
            {CERTS.map((c, i) => (
              <Reveal key={c.issuer} delay={Math.min(i * 0.06, 0.2)}>
                <Cert cert={c} mobile={mobile} motion={motion} />
              </Reveal>
            ))}
          </div>

          <div>
            <Reveal delay={0.08}>
              <div style={{ ...TYPE.label, fontSize: "0.54rem", color: T.blueLit, marginBottom: "1rem" }}>Recognition</div>
            </Reveal>
            {ACHIEVEMENTS.map((a, i) => (
              <Reveal key={a.title} delay={Math.min(0.08 + i * 0.045, 0.3)}>
                <div
                  style={{ display: "grid", gridTemplateColumns: "2.4rem 1fr", gap: "1rem", padding: "0.9rem 0", borderTop: `1px solid ${T.line}`, transition: `transform 0.5s ${EASE.out}` }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(0.7rem)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
                >
                  <span style={{ ...TYPE.meta, fontSize: "0.62rem", color: T.faint }}>{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span style={{ ...TYPE.body, color: T.white, display: "block", fontSize: "0.87rem" }}>{a.title}</span>
                    <span style={{ ...TYPE.meta, fontSize: "0.64rem", display: "block", marginTop: "0.22rem", lineHeight: 1.6 }}>{a.detail}</span>
                  </span>
                </div>
              </Reveal>
            ))}
            <div style={{ borderTop: `1px solid ${T.line}` }} />
          </div>
        </div>
      </Scene>

      {/* ── 07 CRUZA ── */}
      <Scene id="cruza" mobile={mobile} background={T.paper}>
        <SectionHead index="07" title="Cruza" note="Independent studio" mobile={mobile} motion={!reduced} />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "minmax(0,1.2fr) minmax(0,1fr)", gap: mobile ? "2.4rem" : "4rem", alignItems: "start" }}>
          <div>
            <Reveal>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.4rem" }}>
                <span style={{ width: 5, height: 5, background: T.blue, boxShadow: `0 0 0 4px ${blueA(0.16)}`, animation: reduced ? "none" : "blink 2.6s ease-in-out infinite" }} />
                <span style={{ ...TYPE.label, fontSize: "0.55rem", color: T.grey }}>Co-founder · Est. 2025</span>
              </div>
            </Reveal>

            <SplitText
              as="h2"
              enabled={!reduced}
              stagger={0.05}
              style={{ ...TYPE.display(mobile), fontSize: mobile ? "clamp(2.6rem,15vw,4rem)" : "clamp(3rem,5.6vw,5rem)", marginBottom: "1.2rem" }}
            >
              CRUZA
            </SplitText>

            <Reveal delay={0.08}>
              <p style={{ ...TYPE.body, maxWidth: "46ch", marginBottom: "2rem", fontSize: "0.94rem" }}>
                An independent software startup building intelligent systems that solve real problems — not tools
                that impress in a demo and fail in practice.
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <Glass enabled={motion} tilt={motion ? 2 : 0} beam depth={18} style={{ padding: mobile ? "1.2rem" : "1.6rem", marginBottom: "1.6rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem", gap: "1rem" }}>
                  <span style={{ ...TYPE.label, fontSize: "0.53rem", color: T.faint }}>Flagship / 01</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                    <Marker active />
                    <span style={{ ...TYPE.label, fontSize: "0.53rem", color: T.blueLit }}>Live</span>
                  </span>
                </div>
                <h3 style={{ ...TYPE.h3(mobile), marginBottom: "0.55rem" }}>Mentorix AI</h3>
                <p style={{ ...TYPE.body, fontSize: "0.855rem", marginBottom: "1.1rem" }}>
                  Behavioural career intelligence — analyses decision patterns to predict career stability and
                  recommend personalised paths.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem 0.45rem", marginBottom: "1.2rem" }}>
                  {["FastAPI", "RandomForest", "Vercel", "Render"].map((t) => (
                    <span key={t} style={{ ...TYPE.meta, fontSize: "0.62rem", color: T.grey, ...GLASS.chip, padding: "0.16rem 0.48rem" }}>{t}</span>
                  ))}
                </div>
                <Magnetic enabled={motion} strength={0.22}>
                  <a
                    href="https://mentorix-ai.vercel.app" target="_blank" rel="noopener noreferrer"
                    data-cursor={motion ? "link" : undefined} data-cursor-label="VISIT"
                    style={{ ...TYPE.label, fontSize: "0.57rem", color: T.blueLit, textDecoration: "none", borderBottom: `1px solid ${T.blueDim}`, paddingBottom: "0.2rem", transition: "color 0.3s, border-color 0.3s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = T.white; e.currentTarget.style.borderColor = T.blue; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = T.blueLit; e.currentTarget.style.borderColor = T.blueDim; }}
                  >
                    Visit system ↗
                  </a>
                </Magnetic>
              </Glass>
            </Reveal>

            <Reveal delay={0.16}>
              <Magnetic enabled={motion} strength={0.26}>
                <a
                  href="https://cruza.vercel.app" target="_blank" rel="noopener noreferrer"
                  data-cursor={motion ? "link" : undefined} data-cursor-label="VISIT"
                  style={{ ...TYPE.label, fontSize: "0.57rem", color: T.grey, textDecoration: "none", ...GLASS.chip, padding: "0.75rem 1.25rem", display: "inline-block", transition: "color 0.3s, border-color 0.3s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = T.white; e.currentTarget.style.borderColor = whiteA(0.2); }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = T.grey; e.currentTarget.style.borderColor = whiteA(0.07); }}
                >
                  Cruza portfolio ↗
                </a>
              </Magnetic>
            </Reveal>
          </div>

          <Reveal delay={0.14}>
            <div style={{ ...TYPE.label, fontSize: "0.54rem", color: T.faint, marginBottom: "0.9rem" }}>Founders</div>
            <Glass enabled={motion} style={{ padding: mobile ? "0.3rem 1.1rem" : "0.4rem 1.3rem" }}>
              {[
                { name: "Surya J", role: "Systems & Product Engineer", me: true },
                { name: "Buvanashri", role: "Product Strategy", me: false },
                { name: "Shajith", role: "Operations & Project Management", me: false },
              ].map((f, i, arr) => (
                <div key={f.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1rem", padding: "0.9rem 0", borderBottom: i < arr.length - 1 ? `1px solid ${whiteA(0.05)}` : "none" }}>
                  <span>
                    <span style={{ ...TYPE.body, color: T.white, fontSize: "0.87rem", display: "block" }}>{f.name}</span>
                    <span style={{ ...TYPE.meta, fontSize: "0.62rem", display: "block", marginTop: "0.18rem" }}>{f.role}</span>
                  </span>
                  {f.me && <span style={{ ...TYPE.label, fontSize: "0.5rem", color: T.blue, flexShrink: 0 }}>You are here</span>}
                </div>
              ))}
            </Glass>

            <blockquote style={{ marginTop: "1.6rem", paddingLeft: "1.1rem", borderLeft: `2px solid ${T.blue}` }}>
              <p style={{ ...TYPE.body, fontSize: "0.88rem", color: T.grey, margin: 0 }}>
                We build systems that are understandable, maintainable, and genuinely useful — not systems that
                impress in demos but fail in practice.
              </p>
            </blockquote>
          </Reveal>
        </div>
      </Scene>

      {/* ── 08 CONTACT ── */}
      <Scene id="contact" mobile={mobile} background={T.ink} style={{ paddingBottom: mobile ? "3.5rem" : "5rem" }}>
        <SectionHead index="08" title="Contact" mobile={mobile} motion={!reduced} />
        <SplitText
          as="h2"
          enabled={!reduced}
          stagger={0.06}
          style={{ ...TYPE.display(mobile), marginBottom: mobile ? "2.2rem" : "3rem", maxWidth: "16ch" }}
        >
          Let's build something.
        </SplitText>

        <Reveal delay={0.08}>
          <div style={{ borderTop: `1px solid ${T.line2}` }}>
            {CONTACT_LINKS.map((c) => (
              <a
                key={c.label}
                href={c.href} target="_blank" rel="noopener noreferrer"
                data-cursor={motion ? "link" : undefined} data-cursor-label="OPEN"
                style={{
                  position: "relative", display: "grid",
                  gridTemplateColumns: mobile ? "5.2rem 1fr 1.2rem" : "9rem 1fr 2rem",
                  alignItems: "center", gap: "1rem",
                  padding: mobile ? "1.05rem 0" : "1.35rem 0",
                  borderBottom: `1px solid ${T.line}`, textDecoration: "none", overflow: "hidden",
                  transition: `transform 0.55s ${EASE.out}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = mobile ? "translateX(0.6rem)" : "translateX(1.2rem)";
                  const w = e.currentTarget.querySelector("[data-wash]");
                  if (w) { w.style.transform = "scaleX(1)"; w.style.opacity = "1"; }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  const w = e.currentTarget.querySelector("[data-wash]");
                  if (w) { w.style.transform = "scaleX(0)"; w.style.opacity = "0"; }
                }}
              >
                <span
                  data-wash
                  aria-hidden="true"
                  style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    background: `linear-gradient(90deg, ${whiteA(0.06)}, ${blueA(0.05)} 50%, transparent)`,
                    transformOrigin: "left", transform: "scaleX(0)", opacity: 0,
                    transition: `transform 0.7s ${EASE.out}, opacity 0.4s ease`,
                  }}
                />
                <span style={{ ...TYPE.label, fontSize: "0.55rem", color: T.blueLit, position: "relative" }}>{c.label}</span>
                <span style={{ ...TYPE.body, color: T.white, fontSize: mobile ? "0.86rem" : "1rem", wordBreak: "break-word", position: "relative" }}>{c.value}</span>
                <span style={{ ...TYPE.meta, color: T.greyDim, justifySelf: "end", position: "relative" }}>↗</span>
              </a>
            ))}
          </div>
        </Reveal>
      </Scene>

      {/* ── FOOTER ── */}
      <footer style={{ position: "relative", zIndex: 1, padding: mobile ? "1.4rem 1.35rem" : "1.7rem 3rem", borderTop: `1px solid ${T.line}`, background: T.ink, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.6rem" }}>
        <span style={{ ...TYPE.meta, fontSize: "0.6rem", color: T.faint }}>© 2026 Surya J</span>
        <span style={{ ...TYPE.meta, fontSize: "0.6rem", color: T.faint }}>Built by hand · Coimbatore, IN</span>
      </footer>

      <Analytics />
      <SpeedInsights />
    </div>
  );
}
