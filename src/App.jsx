import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import { CERT_IMAGES } from "./assets.js";
import { T, FONT, SHADOW, EASE, blueA } from "./theme.js";
import { CONTACT_LINKS, EXPERIENCE, PROJECTS, PROJECT_FILTERS, CERTS, ACHIEVEMENTS } from "./data.js";
import { useReducedMotion, useIsMobile, useScrubber, useReveal, Reveal, Decode, Magnetic, MOTION_CSS } from "./motion.jsx";
import { Landscape, Particles } from "./world.jsx";
import { Smoke } from "./fluid.jsx";
import { FXArt, FXGrid, FX_CSS } from "./cardfx.jsx";
import { Mockup } from "./mockups.jsx";

/* ─── CONTENT SPECIFIC TO THIS LAYOUT ─────────────────────── */

// "*word*" renders in the italic; a leading "→" renders the ↳ hook and indent.
const CHAPTERS = [
  { id: "top", caption: "Surya J — Software developer · Android, web & backend", lines: ["*I turn*", "ideas into", "→software people", "actually use"] },
  { id: "about", pill: "About", lines: ["*I* build", "→Android apps,", "web platforms", "& their backends"], mono: "CSE at DSCE Coimbatore, class of 2026. Kotlin on the client, Next.js on the web, Go and Python underneath." },
  { id: "now", pill: "Now", lines: ["*Currently*", "shipping at", "→Kosal Tech", "& Manju Global"], mono: "Software developer at Kosal Tech Solutions. On contract with Manju Global: an Android app, an operations ERP and a Go tracking service." },
  { id: "approach", pill: "Approach", lines: ["Simple *by*", "→design, built", "to last"], mono: "Understand the problem before writing code. Keep the architecture small enough for the next engineer to read." },
  { id: "studio", pill: "Studio", lines: ["*Co-founder of*", "→Cruza, an", "independent", "studio"], mono: "Building intelligent systems that solve real problems. Flagship: Mentorix, a live career-intelligence system.", link: { href: "https://cruza.vercel.app", label: "Visit Cruza" } },
];

const SERVICES = [
  ["Android Applications", "Kotlin · Jetpack Compose"],
  ["Web Platforms", "Next.js · React · TypeScript"],
  ["Backend Services", "Go · Python · FastAPI"],
  ["Realtime Systems", "Convex · Firebase"],
  ["Geospatial & Live Tracking", "PostGIS · TimescaleDB · Redis"],
  ["AI & ML Systems", "Generative AI · Prompting · ML"],
  ["Design Systems", "Tokens · Theming · Components"],
  ["APIs & Integrations", "REST · Webhooks · WhatsApp"],
  ["Cross-platform Apps", "Flutter · Firebase"],
  ["Deployment", "Vercel · Render · Docker"],
];

const MENU = [["Home", "top"], ["About", "about"], ["What I do", "services"], ["Experience", "experience"], ["Projects", "projects"], ["Credentials", "credentials"], ["Contact", "contact"]];

/* ─── CSS ─────────────────────────────────────────────────── */
const CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;overflow-x:clip}
  body{background:#f7faff;color:${T.ink};font-family:${FONT.sans};overflow-x:clip}
  ::selection{background:${T.blue};color:#fff}
  a{color:inherit;text-decoration:none}
  button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
  img{max-width:100%;display:block}
  :focus-visible{outline:2px solid ${T.blue};outline-offset:3px;border-radius:6px}

  .wrap{max-width:1320px;margin:0 auto;padding:0 clamp(1.25rem,4vw,3.5rem);position:relative}
  .sec{position:relative;padding:clamp(5.5rem,11vw,10rem) 0;overflow:clip}

  .pill{display:inline-flex;align-items:center;gap:.4rem;font-family:${FONT.mono};font-weight:500;font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;padding:.36rem .72rem;border-radius:999px;background:${T.blue};color:#fff}
  .pill-soft{background:${T.tint};color:${T.blueDeep}}
  .mono{font-family:${FONT.mono};text-transform:uppercase;letter-spacing:.04em}
  .cap{font-family:${FONT.mono};font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:${T.muted}}

  /* display: narrow serif caps with an italic lead-in */
  .disp{font-family:${FONT.serif};font-weight:400;text-transform:uppercase;line-height:.9;letter-spacing:-.005em;color:${T.ink}}
  .disp em{font-style:italic;text-transform:none;color:${T.blue}}
  .hook{font-family:${FONT.sans};font-size:.4em;font-style:normal;color:${T.blue};margin-right:.7em;vertical-align:.45em;display:inline-block}

  /* the world */
  .chapter{position:relative;min-height:100svh;display:flex;flex-direction:column;justify-content:flex-end}
  .petal{position:absolute;border-radius:70% 30% 70% 30%;animation:petal linear infinite;will-change:transform}
  @keyframes petal{
    0%{transform:translate3d(0,-10vh,0) rotate(0deg)}
    100%{transform:translate3d(-38vw,110vh,0) rotate(540deg)}
  }

  /* services — the active row reads, the rest recede */
  .svc{display:grid;grid-template-columns:5.5rem 1fr;align-items:baseline;gap:1rem;padding:.55rem 0;transition:opacity .5s ${EASE.out},transform .6s ${EASE.out}}
  .svc[data-d="0"]{opacity:1}
  .svc[data-d="1"]{opacity:.5}
  .svc[data-d="2"]{opacity:.26}
  .svc[data-d="3"]{opacity:.12}
  .svc .svc-i{font-family:${FONT.mono};font-size:.78rem;color:${T.muted};transition:color .4s ease}
  .svc[data-d="0"] .svc-i{color:${T.blue}}
  .svc .svc-n{justify-self:end;text-align:right;font-weight:500;letter-spacing:-.025em;transition:transform .6s ${EASE.out}}
  .svc[data-d="0"] .svc-n{transform:translate3d(-8px,0,0)}

  /* rows — experience, credentials */
  .row{border-top:1px solid ${T.line2}}
  .row-btn{width:100%;text-align:left;display:grid;align-items:center;gap:1.2rem;padding:1.35rem 0}
  .row-t{transition:transform .6s ${EASE.out},color .3s ease}
  .row-btn:hover .row-t{transform:translate3d(10px,0,0);color:${T.blue}}
  .row-x{transition:transform .6s ${EASE.spring};color:${T.blue}}

  .drawer{display:grid;grid-template-rows:0fr;transition:grid-template-rows .75s ${EASE.out}}
  .drawer.open{grid-template-rows:1fr}
  .drawer>div{overflow:hidden}

  /* project cards */
  .pcard{text-align:left;display:block;width:100%}
  .pcard-art{position:relative;border-radius:18px;background:#fff;border:1px solid ${T.line};overflow:hidden;aspect-ratio:10/8;display:grid;place-items:center;padding:8%;transition:border-color .3s ease}
  .pcard-art .wipe-art{width:100%}
  .pcard-scan{position:absolute;left:-30%;top:0;bottom:0;width:30%;background:linear-gradient(90deg,transparent,${blueA(0.12)},transparent);transform:translate3d(0,0,0);transition:transform .9s ${EASE.out};pointer-events:none}
  .pcard:hover .pcard-art{border-color:${T.ice}}
  .pcard:hover .pcard-scan{transform:translate3d(470%,0,0)}
  .pcard-mock{transition:transform .8s ${EASE.out}}
  .pcard:hover .pcard-mock{transform:scale(1.045)}
  .pcard-name{transition:color .3s ease}
  .pcard:hover .pcard-name{color:${T.blue}}

  .chip{font-family:${FONT.mono};font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;padding:.5rem .85rem;border-radius:999px;border:1px solid ${T.line2};color:${T.body};background:#fff;transition:background-color .3s ease,color .3s ease,border-color .3s ease}
  .chip:hover{border-color:${T.blue};color:${T.blue}}
  .chip.on{background:${T.blue};border-color:${T.blue};color:#fff}

  .tag{display:inline-flex;font-family:${FONT.mono};font-size:.7rem;padding:.28rem .55rem;border-radius:6px;border:1px solid ${T.line};color:${T.body};background:#fff;white-space:nowrap}

  .ghost-btn{display:inline-flex;align-items:center;gap:.6rem;font-weight:500;padding:.85rem 1.3rem;border-radius:999px;border:1px solid ${T.ice};color:${T.navy};background:linear-gradient(180deg,#fff,${T.tint});transition:border-color .3s ease,color .3s ease}
  .ghost-btn:hover{border-color:${T.blue};color:${T.blue}}
  .ghost-btn .arr{transition:transform .5s ${EASE.out}}
  .ghost-btn:hover .arr{transform:translate3d(3px,-3px,0)}

  /* bottom pill navigation */
  .dock{position:fixed;left:50%;bottom:clamp(.9rem,2.4vh,1.6rem);z-index:1000;display:flex;align-items:center;justify-content:space-between;gap:1rem;width:min(380px,calc(100vw - 2rem));height:62px;padding:0 .55rem 0 1.1rem;border-radius:999px;background:linear-gradient(100deg,${T.navy} 0%,${T.blueDeep} 45%,${T.blue} 100%);box-shadow:0 18px 40px -18px rgba(15,34,86,.7),inset 0 1px 0 rgba(255,255,255,.22);transform:translate3d(-50%,0,0)}
  .dock-menu{width:34px;height:34px;display:grid;place-items:center}
  .dock-menu i{display:block;width:22px;height:1.6px;background:#fff;border-radius:2px;transition:transform .5s ${EASE.out}}
  .dock-menu i+i{margin-top:6px}
  .dock-menu.x i:first-child{transform:translate3d(0,3.8px,0) rotate(45deg)}
  .dock-menu.x i:last-child{transform:translate3d(0,-3.8px,0) rotate(-45deg)}
  .orb{position:relative;width:46px;height:46px;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 34% 30%,#fff 0%,#dbe6ff 26%,${T.sky} 62%,${T.blueDeep} 100%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.35)}
  .orb::after{content:"";position:absolute;inset:-30%;background:conic-gradient(from 0deg,rgba(255,255,255,0) 0deg,rgba(255,255,255,.55) 60deg,rgba(255,255,255,0) 140deg);animation:spin 5s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}

  .menu{position:fixed;inset:0;z-index:999;background:#f7faff;display:flex;flex-direction:column;transform:translate3d(0,102%,0);transition:transform .8s ${EASE.inOut};overflow:auto}
  .menu.open{transform:none}
  .menu>.wrap{margin-block:auto;padding-top:5rem}
  .menu-link{display:flex;align-items:baseline;gap:1rem;padding:.2rem 0;opacity:0;transform:translate3d(0,40px,0);transition:opacity .6s ${EASE.out},transform .8s ${EASE.out},color .3s ease}
  .menu.open .menu-link{opacity:1;transform:none}
  .menu-link:hover{color:${T.blue}}

  .modal-bg{position:fixed;inset:0;z-index:1100;background:rgba(10,20,50,.38);animation:fade .35s ease both}
  .modal{position:fixed;left:50%;top:50%;z-index:1101;width:min(1040px,calc(100vw - 2rem));max-height:calc(100svh - 3rem);overflow:auto;background:#fff;border-radius:22px;box-shadow:0 40px 120px -40px rgba(10,20,50,.6);transform:translate3d(-50%,-50%,0);animation:rise .6s ${EASE.out} both}
  @keyframes fade{from{opacity:0}to{opacity:1}}
  @keyframes rise{from{opacity:0;transform:translate3d(-50%,-46%,0)}to{opacity:1;transform:translate3d(-50%,-50%,0)}}

  .loader{position:fixed;inset:0;z-index:2000;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(180deg,#c7d9ff 0%,#eef4ff 60%,#f7faff 100%);transition:transform 1s ${EASE.inOut}}
  .loader.out{transform:translate3d(0,-101%,0)}

  @media (prefers-reduced-motion: reduce){
    html{scroll-behavior:auto}
    .petal,.orb::after{animation:none!important}
    .menu,.menu-link{transition:none!important}
  }
`;

/* ─── SMALL PIECES ────────────────────────────────────────── */

function Arrow({ size = 16, up = false }) {
  return (
    <svg className="arr" width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      {up
        ? <path d="M4.5 11.5l7-7M5.5 4.5h6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        : <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

/** "*italic*" segments and a leading "→" hook, for display lines. */
function DispText({ text }) {
  const hook = text.startsWith("→");
  const body = hook ? text.slice(1) : text;
  const parts = body.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {hook && <span className="hook">↳</span>}
      {parts.map((p, i) => (p.startsWith("*") ? <em key={i}>{p.slice(1, -1)}</em> : <span key={i}>{p}</span>))}
    </>
  );
}

/** Display heading whose lines rise from behind their own baseline. */
function Lines({ lines, motion, style, as: Tag = "h2", stagger = 0.09, delay = 0 }) {
  const ref = useReveal({ enabled: motion });
  return (
    <Tag ref={ref} className="disp sw" style={style}>
      {lines.map((ln, i) => (
        <span key={i} className="sw-m" style={{ display: "block" }}>
          <span className="sw-w" style={{ "--d": `${delay + i * stagger}s` }}><DispText text={ln} /></span>
        </span>
      ))}
    </Tag>
  );
}

function ScrollBar() {
  const ref = useRef(null);
  useEffect(() => {
    let max = 1;
    const refresh = () => { max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); };
    const on = () => { if (ref.current) ref.current.style.transform = `scaleX(${(window.scrollY / max).toFixed(4)})`; };
    refresh(); on();
    const ro = new ResizeObserver(() => { refresh(); on(); });
    ro.observe(document.body);
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", refresh, { passive: true });
    return () => { ro.disconnect(); window.removeEventListener("scroll", on); window.removeEventListener("resize", refresh); };
  }, []);
  return <div ref={ref} aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 1001, background: T.blue, transform: "scaleX(0)", transformOrigin: "left" }} />;
}

/* ─── LOADER ──────────────────────────────────────────────────
   Finishes on its own — a recruiter never has to click to get in. */
function Loader({ onDone, reduced }) {
  const [n, setN] = useState(0);
  const [out, setOut] = useState(false);
  const [gone, setGone] = useState(reduced);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (reduced) { done.current(); return; }
    const t0 = performance.now();
    const DUR = 1500;
    let raf = 0;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / DUR);
      setN(Math.round(100 * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    // timers, not rAF, own the exit — it must happen even if frames stall
    const a = setTimeout(() => { setN(100); setOut(true); done.current(); }, DUR + 150);
    const b = setTimeout(() => setGone(true), DUR + 1250);
    return () => { cancelAnimationFrame(raf); clearTimeout(a); clearTimeout(b); };
  }, [reduced]);

  if (gone) return null;
  return (
    <div className={`loader${out ? " out" : ""}`} aria-hidden="true">
      <div style={{ fontFamily: FONT.serif, fontSize: "clamp(2.6rem,6vw,4rem)", color: T.ink, letterSpacing: "-.01em" }}>
        Surya <em style={{ color: T.blue }}>J</em>
      </div>
      <div className="mono" style={{ fontSize: ".72rem", color: T.navy, marginTop: ".8rem", textAlign: "center" }}>Software developer · Android, web &amp; backend</div>
      <div style={{ width: "min(260px,60vw)", height: 1, background: T.ice, marginTop: "2.2rem", overflow: "hidden" }}>
        <div style={{ height: "100%", background: T.blue, transform: `scaleX(${n / 100})`, transformOrigin: "left" }} />
      </div>
      <div className="mono" style={{ fontSize: ".72rem", color: T.muted, marginTop: ".8rem" }}>{String(n).padStart(3, "0")}</div>
    </div>
  );
}

/* ─── DOCK + MENU ─────────────────────────────────────────── */
function Dock({ open, setOpen, go }) {
  return (
    <nav className="dock" aria-label="Primary">
      <button className={`dock-menu${open ? " x" : ""}`} onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>
        <span><i /><i /></span>
      </button>
      <button onClick={() => go("top")} style={{ fontFamily: FONT.serif, fontSize: "1.45rem", color: "#fff", letterSpacing: "-.01em" }} aria-label="Back to top">
        Surya <em style={{ color: "#c3d2f7" }}>J</em>
      </button>
      <button className="orb" onClick={() => go("contact")} aria-label="Get in touch" title="Get in touch" />
    </nav>
  );
}

function Menu({ open, go, mobile }) {
  return (
    <div className={`menu${open ? " open" : ""}`} aria-hidden={!open}>
      <div className="wrap" style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.6fr 1fr", gap: "3rem", alignItems: "end", paddingBottom: "6rem" }}>
        <div>
          {MENU.map(([label, id], i) => (
            <button key={id} className="menu-link" onClick={() => go(id)} tabIndex={open ? 0 : -1} style={{ transitionDelay: open ? `${0.15 + i * 0.05}s` : "0s" }}>
              <span className="mono" style={{ fontSize: ".72rem", color: T.blue }}>{String(i + 1).padStart(2, "0")}</span>
              <span className="disp" style={{ fontSize: mobile ? "2.6rem" : "clamp(3rem,6vw,5.2rem)" }}>{label}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gap: "1.2rem" }}>
          <span className="pill">Get in touch</span>
          {CONTACT_LINKS.map((c) => (
            <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", borderTop: `1px solid ${T.line2}`, paddingTop: ".8rem" }}>
              <span className="cap">{c.label}</span>
              <span style={{ color: T.ink }}>{c.value}</span>
            </a>
          ))}
          <a className="ghost-btn" href="/Surya_J_Resume.pdf" target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1} style={{ justifySelf: "start", marginTop: ".6rem" }}>Download résumé <Arrow up size={14} /></a>
        </div>
      </div>
    </div>
  );
}

/* ─── THE WORLD ───────────────────────────────────────────────
   A sticky scene the five chapters scroll over. The scrubber turns
   progress through the section into the particle morph (0→4) and a
   camera drift across the landscape layers. */
function World({ mobile, motion, reduced, ready }) {
  const morph = useRef(0);
  const visible = useRef(true);
  const layers = useRef([]);
  const frame = useRef(null);

  const ref = useScrubber((p) => {
    morph.current = p * (CHAPTERS.length - 1);
    const L = layers.current;
    const set = (i, v) => { if (L[i]) L[i].style.transform = v; };
    set(0, `translate3d(0,${(p * -60).toFixed(1)}px,0)`);
    set(1, `translate3d(${(p * -80).toFixed(1)}px,${(p * -30).toFixed(1)}px,0)`);
    set(2, `translate3d(0,${(p * 26).toFixed(1)}px,0)`);
    set(3, `translate3d(0,${(p * 60).toFixed(1)}px,0) scale(${(1 + p * 0.05).toFixed(4)})`);
    set(4, `translate3d(0,${(p * 130).toFixed(1)}px,0) scale(${(1 + p * 0.14).toFixed(4)})`);
    set(5, `translate3d(0,${(p * -120).toFixed(1)}px,0)`);
  }, { mode: "pin", enabled: motion });

  // Pause the particles once the scene has scrolled away. This only ever
  // pauses — if the observer never reports, they keep drawing.
  useEffect(() => {
    const el = frame.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} style={{ position: "relative" }}>
      <div ref={frame} style={{ position: "sticky", top: 0, height: "100svh", overflow: "clip", zIndex: 0 }}>
        <Landscape layers={layers} />
        <Particles morphRef={morph} visibleRef={visible} mobile={mobile} reduced={reduced} />
      </div>

      <div style={{ position: "relative", zIndex: 1, marginTop: "-100svh" }}>
        {CHAPTERS.map((c, i) => (
          <div key={c.id} id={c.id} className="chapter">
            <div className="wrap" style={{ width: "100%", paddingBottom: mobile ? "20svh" : "22svh" }}>
              <div style={{ maxWidth: mobile ? "100%" : "58%" }}>
                {c.caption && (i > 0 || ready) && (
                  <Decode as="p" text={c.caption} enabled={motion} className="mono" style={{ fontSize: ".74rem", color: T.navy, marginBottom: "1.3rem", maxWidth: "40ch" }} />
                )}
                {c.pill && <Reveal dir="up" enabled={motion} style={{ marginBottom: "1.3rem" }}><span className="pill">{c.pill}</span></Reveal>}
                {(i > 0 || ready) && (
                  <Lines
                    as={i === 0 ? "h1" : "h2"}
                    lines={c.lines}
                    motion={motion}
                    delay={i === 0 ? 0.05 : 0}
                    style={{ fontSize: mobile ? "clamp(2.9rem,13vw,4.2rem)" : "clamp(3.6rem,7.2vw,7.4rem)" }}
                  />
                )}
                {c.mono && (
                  <Decode text={c.mono} enabled={motion} delay={0.25} className="mono" style={{ fontSize: mobile ? ".74rem" : ".8rem", lineHeight: 1.6, color: T.navy, marginTop: "1.6rem", maxWidth: "46ch" }} />
                )}
                {c.link && (
                  <Reveal dir="up" delay={0.3} enabled={motion} style={{ marginTop: "1.6rem" }}>
                    <a className="ghost-btn" href={c.link.href} target="_blank" rel="noopener noreferrer">{c.link.label} <Arrow up size={14} /></a>
                  </Reveal>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── WHAT I DO ───────────────────────────────────────────────
   The row nearest the middle of the screen reads fully; the others
   recede by distance. Only rows whose distance bucket changed are
   written, so a scroll through ten rows costs a handful of writes. */
function Services({ mobile, motion }) {
  const rows = useRef([]);
  const last = useRef(-1);
  const listH = useRef(1);
  const n = SERVICES.length;

  // "through" progress runs from the list entering at the bottom to leaving at
  // the top, which is not where you are reading. Convert it back to "which row
  // is at mid-screen" using the list height — cached on resize, never read per frame.
  const ref = useScrubber((p) => {
    const vh = window.innerHeight;
    const H = listH.current;
    const atMiddle = p * (H + vh) - vh / 2; // px from the list top to mid-screen
    const active = Math.min(n - 1, Math.max(0, Math.floor(atMiddle / (H / n))));
    if (active === last.current) return;
    last.current = active;
    rows.current.forEach((el, i) => {
      if (!el) return;
      const d = String(Math.min(3, Math.abs(i - active)));
      if (el.dataset.d !== d) el.dataset.d = d;
      const idx = el.firstChild;
      if (idx) idx.textContent = i === active ? "↳" : `(${String(i + 1).padStart(3, "0")})`;
    });
  }, { mode: "through", enabled: motion });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => { listH.current = Math.max(1, el.offsetHeight); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return (
    <section id="services" className="sec" style={{ background: "linear-gradient(180deg,#f7faff 0%,#ffffff 30%)" }}>
      <div className="wrap">
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1.3fr", gap: mobile ? "2.4rem" : "4rem", alignItems: "start" }}>
          <div style={{ position: mobile ? "static" : "sticky", top: "18vh" }}>
            <Reveal dir="up" enabled={motion} style={{ marginBottom: "1.4rem" }}><span className="pill">What I do</span></Reveal>
            <Lines lines={["Software,", "→*end to end*"]} motion={motion} style={{ fontSize: mobile ? "3rem" : "clamp(3.4rem,5.6vw,5.6rem)", marginBottom: "1.6rem" }} />
            <Reveal dir="up" delay={0.15} enabled={motion}>
              <p style={{ fontFamily: FONT.serif, fontSize: mobile ? "1.35rem" : "1.65rem", lineHeight: 1.3, color: T.text, maxWidth: "30ch" }}>
                <span className="hook" style={{ fontSize: ".7em" }}>↳</span>
                From the Android app in someone's pocket to the service tracking a fleet in real time — designed, built and shipped.
              </p>
            </Reveal>
          </div>

          <div ref={ref}>
            {SERVICES.map(([name, stack], i) => (
              <div key={name} ref={(el) => { rows.current[i] = el; }} className="svc" data-d={motion ? String(Math.min(3, i)) : "0"} style={{ borderTop: `1px solid ${T.line}` }}>
                <span className="svc-i">{i === 0 ? "↳" : `(${String(i + 1).padStart(3, "0")})`}</span>
                <span className="svc-n">
                  <span style={{ display: "block", fontSize: mobile ? "1.5rem" : "clamp(1.8rem,2.8vw,2.7rem)", color: T.ink }}>{name}</span>
                  <span className="mono" style={{ display: "block", fontSize: ".68rem", color: T.muted, marginTop: ".2rem" }}>{stack}</span>
                </span>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${T.line}` }} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── EXPERIENCE ──────────────────────────────────────────── */
function Experience({ mobile, motion }) {
  const [open, setOpen] = useState(0);
  return (
    <section id="experience" className="sec" style={{ background: "#fff" }}>
      <div className="wrap">
        <Reveal dir="up" enabled={motion} style={{ marginBottom: "1.4rem" }}><span className="pill">Experience</span></Reveal>
        <Lines lines={["Where *I've*", "→worked"]} motion={motion} style={{ fontSize: mobile ? "3rem" : "clamp(3.6rem,6.4vw,6.4rem)", marginBottom: mobile ? "2.4rem" : "3.6rem" }} />

        <div style={{ borderBottom: `1px solid ${T.line2}` }}>
          {EXPERIENCE.map((job, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={job.company} dir="up" delay={i * 0.06} enabled={motion} className="row">
                <button className="row-btn" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} style={{ gridTemplateColumns: mobile ? "1fr auto" : "9rem 1fr 1fr auto" }}>
                  {!mobile && <span className="mono" style={{ fontSize: ".72rem", color: job.current ? T.blue : T.muted }}>{job.current ? (job.contract ? "Contract" : "Current") : job.period}</span>}
                  <span className="row-t" style={{ fontFamily: FONT.serif, fontSize: mobile ? "1.9rem" : "clamp(2rem,3.2vw,3rem)", lineHeight: 1.05, color: T.ink }}>
                    {job.company}
                    {mobile && <span className="mono" style={{ display: "block", fontSize: ".68rem", color: T.blue, marginTop: ".4rem" }}>{job.current ? (job.contract ? "Contract" : "Current") : job.period} · {job.role}</span>}
                  </span>
                  {!mobile && <span style={{ color: T.body }}>{job.role}<span className="mono" style={{ display: "block", fontSize: ".66rem", color: T.faint, marginTop: ".2rem" }}>{job.sector}</span></span>}
                  <span className="row-x" style={{ fontSize: "1.5rem", lineHeight: 1, transform: isOpen ? "rotate(45deg)" : "none" }}>+</span>
                </button>
                <div className={`drawer${isOpen ? " open" : ""}`}>
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "9rem 1fr", gap: "1.2rem", paddingBottom: "2rem" }}>
                      {!mobile && <span />}
                      <div>
                        <p style={{ fontSize: "1.08rem", lineHeight: 1.7, color: T.text, maxWidth: "66ch", marginBottom: "1.2rem" }}>{job.about}</p>
                        <ol style={{ listStyle: "none", marginBottom: "1.2rem", maxWidth: "76ch" }}>
                          {job.highlights.map((h, k) => (
                            <li key={k} style={{ display: "grid", gridTemplateColumns: "2.4rem 1fr", padding: ".8rem 0", borderTop: `1px solid ${T.line}` }}>
                              <span className="mono" style={{ fontSize: ".72rem", color: T.blue, paddingTop: ".2rem" }}>{String(k + 1).padStart(2, "0")}</span>
                              <span style={{ lineHeight: 1.65, color: T.body }}>{h}</span>
                            </li>
                          ))}
                        </ol>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
                          {job.stack.map((s) => <span key={s} className="tag">{s}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── PROJECTS ────────────────────────────────────────────── */
function ProjectModal({ project, onClose, mobile }) {
  const closeBtn = useRef(null);
  useEffect(() => {
    if (!project) return;
    const prev = document.activeElement;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    closeBtn.current && closeBtn.current.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      if (prev && prev.focus) prev.focus();
    };
  }, [project, onClose]);

  if (!project) return null;
  return (
    <>
      <div className="modal-bg" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true" aria-label={project.name}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: mobile ? "1.2rem" : "1.6rem 2rem", borderBottom: `1px solid ${T.line}`, position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <span className="mono" style={{ fontSize: ".72rem", color: T.blue }}>{project.id} · {project.cat}</span>
          <button ref={closeBtn} onClick={onClose} aria-label="Close" style={{ width: 40, height: 40, borderRadius: "50%", border: `1px solid ${T.line2}`, fontSize: "1.2rem", color: T.ink }}>×</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? "1.6rem" : "2.6rem", padding: mobile ? "1.4rem" : "2.2rem 2rem 2.6rem" }}>
          <div>
            <div style={{ borderRadius: 16, background: T.paper, border: `1px solid ${T.line}`, padding: "7%" }}>
              <Mockup kind={project.mock} width="100%" draw />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem", marginTop: "1rem" }}>
              {project.stack.map((s) => <span key={s} className="tag">{s}</span>)}
            </div>
          </div>
          <div>
            <h3 className="disp" style={{ fontSize: mobile ? "2.6rem" : "3.4rem", marginBottom: ".4rem" }}>{project.name}</h3>
            <p style={{ color: T.muted, marginBottom: "1.6rem" }}>{project.tag}</p>
            {[["The problem", project.problem], ["The design", project.highlight], ["The outcome", project.power]].map(([k, v]) => (
              <div key={k} style={{ borderTop: `1px solid ${T.line}`, padding: "1rem 0" }}>
                <div className="cap" style={{ color: T.blue, marginBottom: ".4rem" }}>{k}</div>
                <p style={{ lineHeight: 1.7, color: T.text }}>{v}</p>
              </div>
            ))}
            <div style={{ marginTop: "1rem" }}>
              {project.repo
                ? <a className="ghost-btn" href={project.repo} target="_blank" rel="noopener noreferrer">{project.repoLabel} <Arrow up size={14} /></a>
                : <span className="pill pill-soft">{project.org ? `${project.repoLabel} · ${project.org}` : project.repoLabel}</span>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Projects({ mobile, motion }) {
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState(null);
  const close = useCallback(() => setActive(null), []);
  const list = useMemo(() => (filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.cat === filter)), [filter]);
  const cols = mobile ? 1 : 3;

  return (
    <section id="projects" className="sec" style={{ background: "#f7faff" }}>
      <div className="wrap">
        {/* "SOME   of my / PROJECTS" — the split-line heading */}
        <div className="disp" style={{ fontSize: mobile ? "3.2rem" : "clamp(4rem,8vw,8.4rem)", marginBottom: mobile ? "1.6rem" : "2rem" }}>
          <Lines lines={["Some"]} motion={motion} as="div" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1rem", flexWrap: "wrap" }}>
            <Lines lines={["→projects"]} motion={motion} as="div" delay={0.1} />
            <Lines lines={["*of my own*"]} motion={motion} as="div" delay={0.2} />
          </div>
        </div>
        <Decode text="A selection of fifteen: client platforms, products and experiments. Open any one for the problem, the design decision and a schematic." enabled={motion} className="mono" style={{ fontSize: ".78rem", lineHeight: 1.6, color: T.navy, maxWidth: "58ch", marginBottom: "2.4rem" }} />

        <Reveal dir="up" enabled={motion} style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", marginBottom: "2.6rem" }}>
          {PROJECT_FILTERS.map((f) => {
            const n = f === "All" ? PROJECTS.length : PROJECTS.filter((p) => p.cat === f).length;
            return <button key={f} className={`chip${f === filter ? " on" : ""}`} onClick={() => setFilter(f)}>{f} · {n}</button>;
          })}
        </Reveal>

        <FXGrid style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gap: mobile ? "2.4rem" : "3rem 2rem" }}>
          {list.map((p, i) => (
            <Reveal key={p.id} dir="up" delay={(i % cols) * 0.08} enabled={motion}>
              <button className="pcard" onClick={() => setActive(p)} aria-label={`${p.name} — open details`}>
                <FXArt>
                  <div className="pcard-art wipe" style={{ "--d": `${(i % cols) * 0.08 + 0.1}s` }}>
                    <i className="wipe-cover" />
                    <span className="pcard-scan" aria-hidden="true" />
                    <div className="wipe-art"><div className="pcard-mock"><Mockup kind={p.mock} width="100%" draw /></div></div>
                  </div>
                </FXArt>
                <div className="mono" style={{ fontSize: ".68rem", color: T.muted, marginTop: "1rem" }}>{p.stack.slice(0, 2).join(" / ")}</div>
                <div className="pcard-name" style={{ fontFamily: FONT.serif, fontSize: mobile ? "1.8rem" : "2rem", lineHeight: 1.1, color: T.ink, marginTop: ".3rem" }}>{p.name}</div>
              </button>
            </Reveal>
          ))}
        </FXGrid>
      </div>
      <ProjectModal project={active} onClose={close} mobile={mobile} />
    </section>
  );
}

/* ─── CREDENTIALS — an awards-style table ─────────────────── */
function Credentials({ mobile, motion }) {
  const [open, setOpen] = useState(-1);
  return (
    <section id="credentials" className="sec" style={{ background: "#fff" }}>
      <div className="wrap">
        <Lines lines={["Credentials *&*", "recognition"]} motion={motion} style={{ fontSize: mobile ? "2.8rem" : "clamp(3.4rem,6.6vw,6.6rem)", marginBottom: "1.4rem" }} />
        <Decode text="Certified, published and presented — across industry certifications, a conference paper and national hackathons." enabled={motion} className="mono" style={{ fontSize: ".78rem", lineHeight: 1.6, color: T.navy, maxWidth: "52ch", marginBottom: "1.6rem" }} />
        <Reveal dir="up" enabled={motion} style={{ marginBottom: "3rem" }}><span className="pill">Total: {CERTS.length + ACHIEVEMENTS.length}</span></Reveal>

        <Reveal dir="up" enabled={motion} style={{ display: "flex", alignItems: "baseline", gap: ".5rem", padding: "1rem 0", borderTop: `1px solid ${T.ink}` }}>
          <span style={{ fontWeight: 600, letterSpacing: ".02em" }}>CERTIFICATIONS</span>
          <span className="mono" style={{ fontSize: ".7rem", color: T.muted }}>[{String(CERTS.length).padStart(2, "0")}]</span>
        </Reveal>
        {CERTS.map((c, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={c.issuer} dir="up" delay={i * 0.05} enabled={motion} className="row">
              <button className="row-btn" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} style={{ gridTemplateColumns: "1fr auto" }}>
                <span className="row-t" style={{ fontFamily: FONT.serif, fontSize: mobile ? "1.35rem" : "1.7rem", color: T.ink }}>
                  {c.name} <span style={{ color: T.muted, fontSize: ".72em" }}>— {c.issuer}</span>
                </span>
                <span className="mono" style={{ fontSize: ".72rem", color: T.muted }}>{c.date}</span>
              </button>
              <div className={`drawer${isOpen ? " open" : ""}`}>
                <div>
                  <div style={{ paddingBottom: "1.6rem", maxWidth: 720 }}>
                    <img src={CERT_IMAGES[c.img]} alt={`${c.name} certificate`} loading="lazy" style={{ width: "100%", borderRadius: 12, border: `1px solid ${T.line}`, marginBottom: ".8rem" }} />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
                      <span className="tag">{c.full}</span>
                      {c.valid && <span className="tag">{c.valid}</span>}
                      {c.id && <span className="tag">ID {c.id}</span>}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}

        <Reveal dir="up" enabled={motion} style={{ display: "flex", alignItems: "baseline", gap: ".5rem", padding: "1rem 0", borderTop: `1px solid ${T.ink}`, marginTop: "3rem" }}>
          <span style={{ fontWeight: 600, letterSpacing: ".02em" }}>RECOGNITION</span>
          <span className="mono" style={{ fontSize: ".7rem", color: T.muted }}>[{String(ACHIEVEMENTS.length).padStart(2, "0")}]</span>
        </Reveal>
        {ACHIEVEMENTS.map((a, i) => (
          <Reveal key={a.title} dir="up" delay={i * 0.05} enabled={motion} className="row" style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1.2fr", gap: mobile ? ".3rem" : "2rem", padding: "1.2rem 0", alignItems: "baseline" }}>
            <span style={{ fontFamily: FONT.serif, fontSize: mobile ? "1.35rem" : "1.7rem", color: T.ink }}>{a.title}</span>
            <span style={{ color: T.muted }}>{a.detail}</span>
          </Reveal>
        ))}
        <div style={{ borderTop: `1px solid ${T.line2}` }} />
      </div>
    </section>
  );
}

/* ─── CONTACT ─────────────────────────────────────────────── */
function Contact({ mobile, motion }) {
  const email = CONTACT_LINKS.find((c) => c.label === "Email");
  return (
    <section id="contact" className="sec" style={{ background: `linear-gradient(180deg,#fff 0%,${T.tint} 100%)`, paddingBottom: "12rem" }}>
      <div className="wrap">
        <Reveal dir="up" enabled={motion} style={{ marginBottom: "1.4rem" }}><span className="pill">Contact</span></Reveal>
        <Lines lines={["*Let's*", "build", "→something"]} motion={motion} style={{ fontSize: mobile ? "3.6rem" : "clamp(4.4rem,10vw,10rem)", marginBottom: "2.4rem" }} />

        {email && (
          <Reveal dir="up" delay={0.1} enabled={motion}>
            <Magnetic enabled={motion && !mobile} strength={0.12}>
              <a href={email.href} style={{ fontFamily: FONT.serif, fontSize: mobile ? "1.7rem" : "clamp(2rem,4vw,3.6rem)", color: T.blue, borderBottom: `1.5px solid ${T.ice}`, paddingBottom: ".2rem", wordBreak: "break-word" }}>{email.value}</a>
            </Magnetic>
          </Reveal>
        )}

        <Reveal dir="up" delay={0.2} enabled={motion} style={{ display: "flex", flexWrap: "wrap", gap: ".7rem", marginTop: "2.6rem" }}>
          {CONTACT_LINKS.filter((c) => c.label !== "Email").map((c) => (
            <a key={c.label} className="ghost-btn" href={c.href} target="_blank" rel="noopener noreferrer">{c.label} <Arrow up size={14} /></a>
          ))}
          <a className="ghost-btn" href="/Surya_J_Resume.pdf" target="_blank" rel="noopener noreferrer" style={{ background: T.blue, color: "#fff", borderColor: T.blue }}>Download résumé <Arrow up size={14} /></a>
        </Reveal>

        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginTop: "7rem", paddingTop: "1.4rem", borderTop: `1px solid ${T.line2}` }}>
          <span className="cap">© 2026 Surya J</span>
          <span className="cap">Coimbatore, India</span>
        </div>
      </div>
    </section>
  );
}

/* ─── PAGE ────────────────────────────────────────────────── */
export default function Portfolio() {
  const mobile = useIsMobile();
  const reduced = useReducedMotion();
  const motion = !reduced;
  const [ready, setReady] = useState(reduced);
  const [menu, setMenu] = useState(false);
  const onLoaded = useCallback(() => setReady(true), []);

  const go = useCallback((id) => {
    setMenu(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }, [reduced]);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e) => { if (e.key === "Escape") setMenu(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menu]);

  return (
    <>
      <style>{CSS + MOTION_CSS + FX_CSS}</style>
      <Loader onDone={onLoaded} reduced={reduced} />
      <ScrollBar />

      {/* résumé always one click away — the first thing a recruiter looks for */}
      <a
        href="/Surya_J_Resume.pdf" target="_blank" rel="noopener noreferrer"
        className="ghost-btn"
        style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 1000, padding: ".6rem 1rem", fontSize: ".85rem", boxShadow: SHADOW.card }}
      >
        Résumé <Arrow up size={13} />
      </a>

      <main>
        <World mobile={mobile} motion={motion} reduced={reduced} ready={ready} />
        <Services mobile={mobile} motion={motion} />
        <Experience mobile={mobile} motion={motion} />
        <Projects mobile={mobile} motion={motion} />
        <Credentials mobile={mobile} motion={motion} />
        <Contact mobile={mobile} motion={motion} />
      </main>

      {/* cursor smoke: above the page, below the dock, menu and modals */}
      <Smoke />
      <Menu open={menu} go={go} mobile={mobile} />
      <Dock open={menu} setOpen={setMenu} go={go} />

      <Analytics />
      <SpeedInsights />
    </>
  );
}
