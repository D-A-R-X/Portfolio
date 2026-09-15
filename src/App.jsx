import { useState, useEffect, useMemo } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import { PHOTO_B64, CERT_IMAGES } from "./assets.js";
import { T, FONT, TYPE, blueA } from "./theme.js";
import {
  NAV_LINKS, CONTACT_LINKS, EXPERIENCE, SKILL_BARS, PROJECTS, PROJECT_FILTERS,
  CERTS, ACHIEVEMENTS, INTERESTS, PHILOSOPHY, GOALS,
} from "./data.js";
import {
  useReducedMotion, useIsMobile, useScrollY, usePointer, useInView,
  Layer, DepthFrames, Tilt, Reveal, DrawRule, Scene, SectionHead, Marker,
} from "./parallax.jsx";

/* ─── SEGMENTED METER ─────────────────────────────────────── */
/* Reads as an instrument, not a progress bar. */
function Meter({ name, level, delay }) {
  const [ref, inView] = useInView(0.1);
  const cells = 22;
  const filled = Math.round((level / 100) * cells);

  return (
    <div ref={ref} style={{ display: "flex", alignItems: "center", gap: "0.9rem", padding: "0.42rem 0" }}>
      <span style={{ ...TYPE.body, color: T.white, fontSize: "0.83rem", flex: "0 0 auto", minWidth: "8.6rem" }}>
        {name}
      </span>
      <span style={{ display: "flex", gap: "2px", flex: 1, minWidth: 0 }}>
        {Array.from({ length: cells }, (_, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              height: "9px",
              minWidth: "2px",
              background: inView && i < filled ? T.blue : T.line,
              opacity: inView && i < filled ? 1 - (i / cells) * 0.35 : 1,
              transition: `background 0.32s ease ${delay + i * 0.016}s, opacity 0.32s ease ${delay + i * 0.016}s`,
            }}
          />
        ))}
      </span>
      <span style={{ ...TYPE.meta, color: T.greyDim, flex: "0 0 auto", width: "1.8rem", textAlign: "right" }}>
        {level}
      </span>
    </div>
  );
}

/* ─── PROJECT ROW ─────────────────────────────────────────── */
function ProjectRow({ project, mobile, tilt3d }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const lit = hover || open;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ borderBottom: `1px solid ${lit ? T.line2 : T.line}`, transition: "border-color 0.3s" }}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          width: "100%", background: lit ? T.raise : "transparent", border: "none", cursor: "pointer",
          color: "inherit", font: "inherit", textAlign: "left",
          display: "grid",
          gridTemplateColumns: mobile ? "2.2rem 1fr 1.6rem" : "3.4rem minmax(0,1.1fr) minmax(0,1fr) 7.5rem 1.6rem",
          alignItems: "center", gap: mobile ? "0.7rem" : "1.4rem",
          padding: mobile ? "0.95rem 0.6rem" : "1.05rem 1rem",
          transition: "background 0.28s, padding-left 0.28s",
          paddingLeft: lit && !mobile ? "1.5rem" : undefined,
        }}
      >
        <span style={{ ...TYPE.meta, color: lit ? T.blue : T.faint, transition: "color 0.25s" }}>{project.id}</span>

        <span style={{ minWidth: 0 }}>
          <span style={{ ...TYPE.h3(mobile), display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {project.name}
          </span>
          {mobile && (
            <span style={{ ...TYPE.meta, display: "block", marginTop: "0.25rem", fontSize: "0.6rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {project.tag}
            </span>
          )}
        </span>

        {!mobile && (
          <span style={{ ...TYPE.meta, color: T.greyDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {project.tag}
          </span>
        )}

        {!mobile && (
          <span style={{ ...TYPE.label, fontSize: "0.56rem", color: project.org ? T.grey : T.faint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {project.org || project.repoLabel}
          </span>
        )}

        <span
          style={{
            ...TYPE.meta, color: lit ? T.blue : T.greyDim, fontSize: "0.95rem", lineHeight: 1,
            justifySelf: "end", transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), color 0.25s",
            transform: open ? "rotate(45deg)" : "none",
          }}
        >
          +
        </span>
      </button>

      <div style={{ overflow: "hidden", maxHeight: open ? "900px" : "0", transition: "max-height 0.5s cubic-bezier(0.22,1,0.36,1)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
            gap: mobile ? "1.3rem" : "1.7rem 3rem",
            padding: mobile ? "0.4rem 0.6rem 1.7rem" : "0.6rem 1rem 2.1rem 4.4rem",
            background: T.raise,
          }}
        >
          {[["Problem", project.problem], ["Design", project.highlight], ["Outcome", project.power]].map(([k, v]) => (
            <div key={k}>
              <div style={{ ...TYPE.label, fontSize: "0.55rem", color: T.blue, marginBottom: "0.55rem" }}>{k}</div>
              <p style={{ ...TYPE.body, fontSize: "0.855rem", margin: 0 }}>{v}</p>
            </div>
          ))}
          <div>
            <div style={{ ...TYPE.label, fontSize: "0.55rem", color: T.blue, marginBottom: "0.6rem" }}>Stack</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem 0.5rem" }}>
              {project.stack.map((s) => (
                <span key={s} style={{ ...TYPE.meta, fontSize: "0.63rem", color: T.grey, border: `1px solid ${T.line2}`, padding: "0.16rem 0.48rem" }}>
                  {s}
                </span>
              ))}
            </div>
            <div style={{ marginTop: "1.2rem" }}>
              {project.repo ? (
                <a
                  href={project.repo} target="_blank" rel="noopener noreferrer"
                  style={{ ...TYPE.label, fontSize: "0.58rem", color: T.blueLit, textDecoration: "none", borderBottom: `1px solid ${T.blueDim}`, paddingBottom: "0.2rem", transition: "border-color 0.25s, color 0.25s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.blue; e.currentTarget.style.color = T.white; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.blueDim; e.currentTarget.style.color = T.blueLit; }}
                >
                  {project.repoLabel} ↗
                </a>
              ) : (
                <span style={{ ...TYPE.label, fontSize: "0.58rem", color: T.faint }}>{project.repoLabel}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── EXPERIENCE ENTRY ────────────────────────────────────── */
function Role({ job, mobile, tilt3d }) {
  const [hover, setHover] = useState(false);
  return (
    <Tilt enabled={tilt3d} max={1.6} lift={5}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : "minmax(0,13rem) 1fr",
          gap: mobile ? "0.85rem" : "2.6rem",
          padding: mobile ? "1.5rem 0" : "1.9rem 0",
          borderTop: `1px solid ${hover ? T.line2 : T.line}`,
          transition: "border-color 0.3s",
        }}
      >
        {/* left rail: company + period */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
            <Marker active={job.current} />
            <span style={{ ...TYPE.meta, color: job.current ? T.blueLit : T.greyDim, fontSize: "0.63rem" }}>
              {job.current ? "CURRENT" : job.period}
            </span>
          </div>
          <h3 style={{ ...TYPE.h3(mobile), margin: 0 }}>{job.company}</h3>
        </div>

        {/* right: role + summary + stack */}
        <div>
          <div style={{ ...TYPE.label, fontSize: "0.58rem", color: T.blue, marginBottom: "0.7rem" }}>{job.role}</div>
          <p style={{ ...TYPE.body, margin: "0 0 0.95rem", maxWidth: "60ch" }}>{job.summary}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem 0.45rem" }}>
            {job.stack.map((s) => (
              <span key={s} style={{ ...TYPE.meta, fontSize: "0.62rem", color: T.greyDim, border: `1px solid ${T.line}`, padding: "0.14rem 0.45rem" }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Tilt>
  );
}

/* ─── CERT ────────────────────────────────────────────────── */
function Cert({ cert, mobile }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ borderTop: `1px solid ${hover || open ? T.line2 : T.line}`, transition: "border-color 0.3s" }}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", color: "inherit", font: "inherit", textAlign: "left", padding: "1.05rem 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}
      >
        <span>
          <span style={{ ...TYPE.label, fontSize: "0.55rem", color: T.blue, display: "block", marginBottom: "0.4rem" }}>{cert.issuer}</span>
          <span style={{ ...TYPE.body, color: T.white, display: "block", fontSize: "0.9rem" }}>{cert.name}</span>
          <span style={{ ...TYPE.meta, fontSize: "0.63rem", display: "block", marginTop: "0.2rem" }}>{cert.full}</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.7rem", flexShrink: 0 }}>
          <span style={{ ...TYPE.meta, fontSize: "0.62rem", whiteSpace: "nowrap" }}>{cert.date}</span>
          <span style={{ ...TYPE.meta, color: open ? T.blue : T.greyDim, fontSize: "0.9rem", lineHeight: 1, transform: open ? "rotate(45deg)" : "none", transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), color 0.2s", display: "inline-block" }}>+</span>
        </span>
      </button>
      <div style={{ overflow: "hidden", maxHeight: open ? "620px" : "0", transition: "max-height 0.5s cubic-bezier(0.22,1,0.36,1)" }}>
        <div style={{ paddingBottom: "1.4rem" }}>
          <img src={CERT_IMAGES[cert.img]} alt={cert.name} loading="lazy" style={{ width: "100%", display: "block", border: `1px solid ${T.line2}`, marginBottom: "0.9rem", filter: "grayscale(0.15)" }} />
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
  );
}

/* ─── MAIN ────────────────────────────────────────────────── */
export default function Portfolio() {
  const mobile = useIsMobile();
  const wide = !useIsMobile(1180);
  const reduced = useReducedMotion();
  const scrollY = useScrollY();
  const depth3d = !mobile && !reduced;
  const pointer = usePointer(depth3d);

  const [navOpen, setNavOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [docHeight, setDocHeight] = useState(1);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const measure = () => setDocHeight(Math.max(1, document.body.scrollHeight - window.innerHeight));
    measure();
    window.addEventListener("resize", measure);
    const id = setInterval(measure, 1500);
    return () => { window.removeEventListener("resize", measure); clearInterval(id); };
  }, []);

  useEffect(() => {
    const tick = () =>
      setClock(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata", hour12: false,
        }).format(new Date())
      );
    tick();
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, []);

  const scrolled = scrollY > 30;
  const progress = Math.min(1, scrollY / docHeight);

  const scrollTo = (id) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    setNavOpen(false);
  };

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

  const heroOut = Math.max(0, 1 - scrollY / 620);

  return (
    <div style={{ background: T.ink, color: T.white, minHeight: "100vh", fontFamily: FONT.sans, overflowX: "hidden" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;}
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
        @keyframes drop{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.25}}
        @media (prefers-reduced-motion: reduce){
          *{animation-duration:0.001ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important;}
          html{scroll-behavior:auto;}
        }
      `}</style>

      {/* ── NAV ── */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
          padding: mobile ? "0.9rem 1.35rem" : "1.05rem 3rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: scrolled || navOpen ? "rgba(8,9,12,0.9)" : "transparent",
          backdropFilter: scrolled || navOpen ? "blur(10px)" : "none",
          borderBottom: `1px solid ${scrolled ? T.line : "transparent"}`,
          transition: "background 0.35s, border-color 0.35s",
        }}
      >
        <button
          onClick={() => scrollTo("top")}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "baseline", gap: "0.55rem", padding: 0 }}
        >
          <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: "0.92rem", letterSpacing: "-0.03em", color: T.white }}>Surya J</span>
          <span style={{ ...TYPE.meta, fontSize: "0.58rem", color: T.faint }}>/ DARX</span>
        </button>

        {mobile ? (
          <button
            onClick={() => setNavOpen(!navOpen)}
            aria-label={navOpen ? "Close menu" : "Open menu"}
            aria-expanded={navOpen}
            style={{ background: "none", border: `1px solid ${T.line2}`, color: T.white, cursor: "pointer", minWidth: "40px", minHeight: "36px", ...TYPE.label, fontSize: "0.55rem" }}
          >
            {navOpen ? "CLOSE" : "MENU"}
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "1.35rem" }}>
            {NAV_LINKS.map((l) => (
              <button
                key={l} onClick={() => scrollTo(l)}
                style={{ background: "none", border: "none", ...TYPE.label, fontSize: "0.58rem", color: T.greyDim, padding: "0.4rem 0", cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = T.white)}
                onMouseLeave={(e) => (e.currentTarget.style.color = T.greyDim)}
              >
                {l}
              </button>
            ))}
            {wide && (
              <span style={{ ...TYPE.meta, fontSize: "0.58rem", color: T.faint, borderLeft: `1px solid ${T.line2}`, paddingLeft: "1.1rem" }}>
                IST {clock}
              </span>
            )}
          </div>
        )}

        <div aria-hidden="true" style={{ position: "absolute", left: 0, bottom: 0, height: "1px", width: `${progress * 100}%`, background: T.blue, transition: "width 0.1s linear" }} />
      </nav>

      {mobile && navOpen && (
        <div style={{ position: "fixed", top: "53px", left: 0, right: 0, zIndex: 999, background: "rgba(8,9,12,0.98)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.line}`, padding: "0 1.35rem 1.2rem", animation: "drop 0.2s ease" }}>
          {NAV_LINKS.map((l) => (
            <button
              key={l} onClick={() => scrollTo(l)}
              style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: `1px solid ${T.line}`, ...TYPE.label, fontSize: "0.66rem", color: T.grey, padding: "0.95rem 0", cursor: "pointer", minHeight: "46px" }}
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
          position: "relative", overflow: "hidden",
        }}
      >
        {/* structural backplane */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute", inset: "-10%", pointerEvents: "none",
            backgroundImage: `linear-gradient(90deg, ${T.line} 1px, transparent 1px)`,
            backgroundSize: mobile ? "60px 100%" : "104px 100%",
            opacity: 0.6,
            transform: `translate3d(${pointer.x * -10 - scrollY * 0.02}px, 0, 0)`,
            maskImage: "linear-gradient(to bottom, #000 40%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, #000 40%, transparent)",
          }}
        />
        <Layer depth={0.35} scrollY={scrollY} pointer={pointer} style={{ top: "14%", right: "6%" }}>
          <div style={{ width: mobile ? 260 : 540, height: mobile ? 260 : 540, background: `radial-gradient(circle, ${blueA(0.085)} 0%, transparent 62%)` }} />
        </Layer>

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "1180px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "minmax(0,1.32fr) minmax(0,1fr)", gap: mobile ? "3rem" : "4rem", alignItems: "center" }}>
            {/* LEFT */}
            <div>
              <Reveal>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: mobile ? "1.6rem" : "2.1rem" }}>
                  <span style={{ width: 5, height: 5, background: T.blue, animation: reduced ? "none" : "blink 2.4s ease-in-out infinite" }} />
                  <span style={{ ...TYPE.label, fontSize: "0.57rem", color: T.grey }}>Available for work</span>
                  <span style={{ width: "2.2rem", height: "1px", background: T.line2 }} />
                  <span style={{ ...TYPE.meta, fontSize: "0.6rem", color: T.faint }}>Coimbatore, IN</span>
                </div>
              </Reveal>

              <Reveal delay={0.05}>
                <h1 style={{ ...TYPE.display(mobile), marginBottom: mobile ? "1.3rem" : "1.6rem" }}>
                  App &amp; web
                  <br />
                  developer
                  <br />
                  <span style={{ color: T.greyDim }}>building</span>{" "}
                  <span style={{ position: "relative", whiteSpace: "nowrap" }}>
                    real systems
                    <span aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: "0.08em", height: "3px", background: T.blue }} />
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={0.1}>
                <p style={{ ...TYPE.body, maxWidth: "48ch", marginBottom: mobile ? "2rem" : "2.4rem", fontSize: "0.94rem" }}>
                  I'm Surya — at <span style={{ color: T.white }}>Kosal Tech Solutions</span>, building alongside{" "}
                  <span style={{ color: T.white }}>Manju Global</span> and <span style={{ color: T.white }}>AIVIDA</span>.
                  Android apps in Kotlin, platforms in Next.js, and the Go and Python services underneath.
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.7rem", marginBottom: mobile ? "2.4rem" : "3rem" }}>
                  <a
                    href="/Surya_J_Resume.pdf" target="_blank" rel="noopener noreferrer"
                    style={{ ...TYPE.label, fontSize: "0.6rem", background: T.blue, color: "#fff", textDecoration: "none", padding: "0.78rem 1.3rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", minHeight: "42px", transition: "background 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#1a4fe0")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = T.blue)}
                  >
                    Resume <span aria-hidden="true">↓</span>
                  </a>
                  <button
                    onClick={() => scrollTo("work")}
                    style={{ ...TYPE.label, fontSize: "0.6rem", background: "none", border: `1px solid ${T.line2}`, color: T.grey, padding: "0.78rem 1.3rem", cursor: "pointer", minHeight: "42px", transition: "border-color 0.2s, color 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.line3; e.currentTarget.style.color = T.white; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.line2; e.currentTarget.style.color = T.grey; }}
                  >
                    Selected work →
                  </button>
                </div>
              </Reveal>

              {/* metadata table, not stat cards */}
              <Reveal delay={0.2}>
                <div style={{ borderTop: `1px solid ${T.line}` }}>
                  {[
                    ["Currently", "Kosal Tech · Manju Global · AIVIDA"],
                    ["Studying", "B.E. CSE, DSCE Coimbatore — 2022/2026"],
                    ["Also", "Co-founder, Cruza"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "grid", gridTemplateColumns: mobile ? "6.2rem 1fr" : "8rem 1fr", gap: "1rem", padding: "0.62rem 0", borderBottom: `1px solid ${T.line}` }}>
                      <span style={{ ...TYPE.label, fontSize: "0.54rem", color: T.faint }}>{k}</span>
                      <span style={{ ...TYPE.meta, fontSize: "0.68rem", color: T.grey }}>{v}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* RIGHT — the 3D object */}
            {!mobile && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "2.6rem", opacity: heroOut }}>
                <DepthFrames pointer={pointer} size={252} enabled={depth3d}>
                  <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", border: `1px solid ${T.line3}` }}>
                    <img
                      src={PHOTO_B64}
                      alt="Surya J"
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block", filter: "grayscale(1) contrast(1.08)" }}
                    />
                    <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: blueA(0.14), mixBlendMode: "color" }} />
                    <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "0.55rem 0.7rem", background: "rgba(8,9,12,0.82)", borderTop: `1px solid ${T.line2}`, display: "flex", justifyContent: "space-between" }}>
                      <span style={{ ...TYPE.meta, fontSize: "0.55rem", color: T.grey }}>SURYA J</span>
                      <span style={{ ...TYPE.meta, fontSize: "0.55rem", color: T.blue }}>DARX</span>
                    </div>
                  </div>
                </DepthFrames>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 01 PROFILE ── */}
      <Scene id="about" mobile={mobile} pointer={pointer} background={T.paper}>
        <SectionHead index="01" title="Profile" mobile={mobile} />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "minmax(0,1.25fr) minmax(0,1fr)", gap: mobile ? "2.2rem" : "4rem" }}>
          <Reveal>
            <h2 style={{ ...TYPE.h2(mobile), marginBottom: "1.4rem", maxWidth: "22ch" }}>
              I build things that hold up outside the demo.
            </h2>
            <p style={{ ...TYPE.body, marginBottom: "1.1rem", maxWidth: "58ch" }}>
              CSE student at DSCE Coimbatore, 2022–2026, and a working app and web developer. I'm at Kosal Tech
              Solutions and build alongside Manju Global and AIVIDA — shipping Android clients, Next.js platforms,
              and the services behind them.
            </p>
            <p style={{ ...TYPE.body, color: T.greyDim, maxWidth: "58ch" }}>
              The approach is deliberate: understand the domain before writing code, then keep the architecture small
              enough that the next person can read it. I also co-founded Cruza, an independent studio building
              intelligent systems.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div style={{ borderTop: `1px solid ${T.line2}` }}>
              {[
                ["College", "DSCE, Coimbatore"],
                ["Degree", "B.E. Computer Science"],
                ["Batch", "2022 — 2026"],
                ["Based", "Coimbatore, Tamil Nadu"],
                ["Roles", "Kosal · Manju Global · AIVIDA"],
                ["Startup", "Cruza — Co-founder"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "6.5rem 1fr", gap: "1rem", padding: "0.75rem 0", borderBottom: `1px solid ${T.line}` }}>
                  <span style={{ ...TYPE.label, fontSize: "0.54rem", color: T.faint }}>{k}</span>
                  <span style={{ ...TYPE.body, fontSize: "0.83rem", color: T.white }}>{v}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Scene>

      {/* ── 02 EXPERIENCE ── */}
      <Scene id="experience" mobile={mobile} pointer={pointer} background={T.ink}>
        <SectionHead index="02" title="Experience" note={`${EXPERIENCE.filter((e) => e.current).length} current roles`} mobile={mobile} />
        <div>
          {EXPERIENCE.map((job, i) => (
            <Reveal key={job.company} delay={Math.min(i * 0.05, 0.2)}>
              <Role job={job} mobile={mobile} tilt3d={depth3d} />
            </Reveal>
          ))}
          <div style={{ borderTop: `1px solid ${T.line}` }} />
        </div>
      </Scene>

      {/* ── 03 STACK ── */}
      <Scene id="stack" mobile={mobile} pointer={pointer} background={T.paper}>
        <SectionHead index="03" title="Stack" note={`${SKILL_BARS.length} tracked`} mobile={mobile} />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? "2rem" : "2rem 4rem" }}>
          {skillGroups.map(([cat, items], gi) => (
            <Reveal key={cat} delay={Math.min(gi * 0.05, 0.25)}>
              <div style={{ marginBottom: "0.4rem" }}>
                <div style={{ ...TYPE.label, fontSize: "0.54rem", color: T.blue, marginBottom: "0.6rem" }}>{cat}</div>
                <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: "0.35rem" }}>
                  {items.map((s, i) => (
                    <Meter key={s.name} name={s.name} level={s.level} delay={i * 0.05} />
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div style={{ marginTop: "2.6rem", paddingTop: "1.8rem", borderTop: `1px solid ${T.line}` }}>
          <Reveal>
            <div style={{ ...TYPE.label, fontSize: "0.54rem", color: T.faint, marginBottom: "1rem" }}>Interests</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem 0.5rem" }}>
              {INTERESTS.map((t) => (
                <span
                  key={t}
                  style={{ ...TYPE.meta, fontSize: "0.66rem", color: T.grey, border: `1px solid ${T.line}`, padding: "0.28rem 0.62rem", transition: "border-color 0.2s, color 0.2s", cursor: "default" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.line3; e.currentTarget.style.color = T.white; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.line; e.currentTarget.style.color = T.grey; }}
                >
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </Scene>

      {/* ── 04 WORK ── */}
      <Scene id="work" mobile={mobile} pointer={pointer} background={T.ink}>
        <SectionHead index="04" title="Selected Work" note={`${PROJECTS.length} projects`} mobile={mobile} />

        <Reveal>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.4rem", marginBottom: "1.6rem" }}>
            {PROJECT_FILTERS.map((f) => {
              const active = filter === f;
              const count = f === "All" ? PROJECTS.length : PROJECTS.filter((p) => p.cat === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    ...TYPE.label, fontSize: "0.57rem", background: "none", border: "none", cursor: "pointer",
                    color: active ? T.white : T.faint,
                    borderBottom: `1px solid ${active ? T.blue : "transparent"}`,
                    paddingBottom: "0.35rem", transition: "color 0.2s, border-color 0.2s",
                  }}
                >
                  {f}
                  <sup style={{ ...TYPE.meta, fontSize: "0.5rem", marginLeft: "0.25rem", color: active ? T.blue : T.faint }}>{count}</sup>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div style={{ borderTop: `1px solid ${T.line2}` }}>
          {visibleProjects.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i * 0.03, 0.24)}>
              <ProjectRow project={p} mobile={mobile} tilt3d={depth3d} />
            </Reveal>
          ))}
        </div>
      </Scene>

      {/* ── 05 APPROACH (philosophy + direction, consolidated) ── */}
      <Scene id="approach" mobile={mobile} pointer={pointer} background={T.paper}>
        <SectionHead index="05" title="Approach" mobile={mobile} />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? "2.6rem" : "4rem" }}>
          <div>
            <Reveal>
              <div style={{ ...TYPE.label, fontSize: "0.54rem", color: T.blue, marginBottom: "1.1rem" }}>How I build</div>
            </Reveal>
            {PHILOSOPHY.map((p, i) => (
              <Reveal key={p.t} delay={Math.min(i * 0.05, 0.2)}>
                <div style={{ display: "grid", gridTemplateColumns: "2.4rem 1fr", gap: "1rem", padding: "1rem 0", borderTop: `1px solid ${T.line}` }}>
                  <span style={{ ...TYPE.meta, fontSize: "0.63rem", color: T.faint }}>{p.n}</span>
                  <span>
                    <span style={{ ...TYPE.body, color: T.white, display: "block", fontSize: "0.9rem", marginBottom: "0.3rem" }}>{p.t}</span>
                    <span style={{ ...TYPE.body, fontSize: "0.84rem", display: "block" }}>{p.b}</span>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>

          <div>
            <Reveal delay={0.08}>
              <div style={{ ...TYPE.label, fontSize: "0.54rem", color: T.blue, marginBottom: "1.1rem" }}>Where it's going</div>
            </Reveal>
            {GOALS.map((g, i) => (
              <Reveal key={g.t} delay={Math.min(0.08 + i * 0.05, 0.25)}>
                <div style={{ display: "grid", gridTemplateColumns: "2.4rem 1fr", gap: "1rem", padding: "1rem 0", borderTop: `1px solid ${T.line}` }}>
                  <span style={{ ...TYPE.meta, fontSize: "0.63rem", color: T.faint }}>{g.n}</span>
                  <span>
                    <span style={{ ...TYPE.body, color: T.white, display: "block", fontSize: "0.9rem", marginBottom: "0.3rem" }}>{g.t}</span>
                    <span style={{ ...TYPE.body, fontSize: "0.84rem", display: "block" }}>{g.b}</span>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Scene>

      {/* ── 06 CREDENTIALS (certs + achievements together) ── */}
      <Scene id="credentials" mobile={mobile} pointer={pointer} background={T.ink}>
        <SectionHead index="06" title="Credentials" mobile={mobile} />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? "2.6rem" : "4rem" }}>
          <div>
            <Reveal>
              <div style={{ ...TYPE.label, fontSize: "0.54rem", color: T.blue, marginBottom: "1rem" }}>Certifications</div>
            </Reveal>
            {CERTS.map((c, i) => (
              <Reveal key={c.issuer} delay={Math.min(i * 0.05, 0.2)}>
                <Cert cert={c} mobile={mobile} />
              </Reveal>
            ))}
            <div style={{ borderTop: `1px solid ${T.line}` }} />
          </div>

          <div>
            <Reveal delay={0.08}>
              <div style={{ ...TYPE.label, fontSize: "0.54rem", color: T.blue, marginBottom: "1rem" }}>Recognition</div>
            </Reveal>
            {ACHIEVEMENTS.map((a, i) => (
              <Reveal key={a.title} delay={Math.min(0.08 + i * 0.04, 0.26)}>
                <div style={{ display: "grid", gridTemplateColumns: "2.4rem 1fr", gap: "1rem", padding: "0.85rem 0", borderTop: `1px solid ${T.line}` }}>
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
      <Scene id="cruza" mobile={mobile} pointer={pointer} background={T.paper}>
        <SectionHead index="07" title="Cruza" note="Independent studio" mobile={mobile} />
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "minmax(0,1.2fr) minmax(0,1fr)", gap: mobile ? "2.6rem" : "4rem", alignItems: "start" }}>
          <div>
            <Reveal>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.4rem" }}>
                <span style={{ width: 5, height: 5, background: T.blue, animation: reduced ? "none" : "blink 2.4s ease-in-out infinite" }} />
                <span style={{ ...TYPE.label, fontSize: "0.55rem", color: T.grey }}>Co-founder · Est. 2025</span>
              </div>
              <h2 style={{ ...TYPE.display(mobile), fontSize: mobile ? "clamp(2.6rem,15vw,4rem)" : "clamp(3rem,5.6vw,5rem)", marginBottom: "1.2rem" }}>
                CRUZA
              </h2>
              <p style={{ ...TYPE.body, maxWidth: "46ch", marginBottom: "2rem", fontSize: "0.94rem" }}>
                An independent software startup building intelligent systems that solve real problems — not tools
                that impress in a demo and fail in practice.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div style={{ border: `1px solid ${T.line2}`, padding: mobile ? "1.1rem" : "1.5rem", marginBottom: "1.6rem", background: T.raise }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem", gap: "1rem" }}>
                  <span style={{ ...TYPE.label, fontSize: "0.53rem", color: T.faint }}>Flagship / 01</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                    <Marker active />
                    <span style={{ ...TYPE.label, fontSize: "0.53rem", color: T.blue }}>Live</span>
                  </span>
                </div>
                <h3 style={{ ...TYPE.h3(mobile), marginBottom: "0.55rem" }}>Mentorix AI</h3>
                <p style={{ ...TYPE.body, fontSize: "0.855rem", marginBottom: "1.1rem" }}>
                  Behavioural career intelligence — analyses decision patterns to predict career stability and
                  recommend personalised paths.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem 0.45rem", marginBottom: "1.2rem" }}>
                  {["FastAPI", "RandomForest", "Vercel", "Render"].map((t) => (
                    <span key={t} style={{ ...TYPE.meta, fontSize: "0.62rem", color: T.greyDim, border: `1px solid ${T.line}`, padding: "0.14rem 0.45rem" }}>{t}</span>
                  ))}
                </div>
                <a
                  href="https://mentorix-ai.vercel.app" target="_blank" rel="noopener noreferrer"
                  style={{ ...TYPE.label, fontSize: "0.57rem", color: T.blueLit, textDecoration: "none", borderBottom: `1px solid ${T.blueDim}`, paddingBottom: "0.2rem", transition: "color 0.2s, border-color 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = T.white; e.currentTarget.style.borderColor = T.blue; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = T.blueLit; e.currentTarget.style.borderColor = T.blueDim; }}
                >
                  Visit system ↗
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <a
                href="https://cruza.vercel.app" target="_blank" rel="noopener noreferrer"
                style={{ ...TYPE.label, fontSize: "0.57rem", color: T.grey, textDecoration: "none", border: `1px solid ${T.line2}`, padding: "0.7rem 1.2rem", display: "inline-block", transition: "border-color 0.2s, color 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.line3; e.currentTarget.style.color = T.white; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.line2; e.currentTarget.style.color = T.grey; }}
              >
                Cruza portfolio ↗
              </a>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <div style={{ ...TYPE.label, fontSize: "0.54rem", color: T.faint, marginBottom: "0.9rem" }}>Founders</div>
            <div style={{ borderTop: `1px solid ${T.line2}` }}>
              {[
                { name: "Surya J", role: "Systems & Product Engineer", me: true },
                { name: "Buvanashri", role: "Product Strategy", me: false },
                { name: "Shajith", role: "Operations & Project Management", me: false },
              ].map((f) => (
                <div key={f.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1rem", padding: "0.85rem 0", borderBottom: `1px solid ${T.line}` }}>
                  <span>
                    <span style={{ ...TYPE.body, color: T.white, fontSize: "0.87rem", display: "block" }}>{f.name}</span>
                    <span style={{ ...TYPE.meta, fontSize: "0.62rem", display: "block", marginTop: "0.18rem" }}>{f.role}</span>
                  </span>
                  {f.me && <span style={{ ...TYPE.label, fontSize: "0.5rem", color: T.blue, flexShrink: 0 }}>You are here</span>}
                </div>
              ))}
            </div>

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
      <Scene id="contact" mobile={mobile} pointer={pointer} background={T.ink} style={{ paddingBottom: mobile ? "3.5rem" : "5rem" }}>
        <SectionHead index="08" title="Contact" mobile={mobile} />
        <Reveal>
          <h2 style={{ ...TYPE.display(mobile), marginBottom: mobile ? "2.2rem" : "3rem", maxWidth: "16ch" }}>
            Let's build
            <br />
            <span style={{ color: T.greyDim }}>something.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <div style={{ borderTop: `1px solid ${T.line2}` }}>
            {CONTACT_LINKS.map((c) => (
              <a
                key={c.label}
                href={c.href} target="_blank" rel="noopener noreferrer"
                style={{
                  display: "grid",
                  gridTemplateColumns: mobile ? "5.2rem 1fr 1.2rem" : "9rem 1fr 2rem",
                  alignItems: "center", gap: "1rem",
                  padding: mobile ? "1rem 0" : "1.25rem 0",
                  borderBottom: `1px solid ${T.line}`, textDecoration: "none",
                  transition: "padding-left 0.28s, background 0.28s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = mobile ? "0.5rem" : "1rem"; e.currentTarget.style.background = T.raise; }}
                onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "0"; e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ ...TYPE.label, fontSize: "0.55rem", color: T.blue }}>{c.label}</span>
                <span style={{ ...TYPE.body, color: T.white, fontSize: mobile ? "0.86rem" : "1rem", wordBreak: "break-word" }}>{c.value}</span>
                <span style={{ ...TYPE.meta, color: T.greyDim, justifySelf: "end" }}>↗</span>
              </a>
            ))}
          </div>
        </Reveal>
      </Scene>

      {/* ── FOOTER ── */}
      <footer style={{ padding: mobile ? "1.4rem 1.35rem" : "1.7rem 3rem", borderTop: `1px solid ${T.line}`, background: T.ink, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.6rem" }}>
        <span style={{ ...TYPE.meta, fontSize: "0.6rem", color: T.faint }}>© 2026 Surya J</span>
        <span style={{ ...TYPE.meta, fontSize: "0.6rem", color: T.faint }}>Built by hand · Coimbatore, IN</span>
      </footer>

      <Analytics />
      <SpeedInsights />
    </div>
  );
}
