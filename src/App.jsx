import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import { CERT_IMAGES } from "./assets.js";
import { T, FONT, TYPE, SHADOW, EASE, blueA, THEME_CSS, RAW } from "./theme.js";
import { CONTACT_LINKS, EXPERIENCE, EDUCATION, SKILL_BARS, PROJECTS, PROJECT_FILTERS, ORGS, CERTS, ACHIEVEMENTS, INTERESTS, PHILOSOPHY, GOALS } from "./data.js";
import { useReducedMotion, useIsMobile, useScrubber, useReveal, Reveal, Decode, Magnetic, MOTION_CSS } from "./motion.jsx";
import { Landscape, Particles } from "./world.jsx";
import { Smoke } from "./fluid.jsx";
import { FXArt, FXGrid, FX_CSS } from "./cardfx.jsx";
import { Mockup } from "./mockups.jsx";

/* ─── CONTENT SPECIFIC TO THIS LAYOUT ─────────────────────── */

// "*word*" renders in the italic; a leading "→" renders the rule mark and indent.
const CHAPTERS = [
  { id: "top", name: "Surya J", caption: "Software developer · Android, web & backend", lines: ["*I turn*", "ideas into", "→software people", "actually use"] },
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

const MENU = [["Home", "top"], ["About", "about"], ["What I do", "services"], ["Experience", "experience"], ["Background", "background"], ["Projects", "projects"], ["Credentials", "credentials"], ["Contact", "contact"]];

/* ─── CSS ─────────────────────────────────────────────────── */
const CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;overflow-x:clip}
  body{background:${T.bg};color:${T.ink};font-family:${FONT.sans};overflow-x:clip}
  ::selection{background:${T.blue};color:${T.surface}}
  a{color:inherit;text-decoration:none}
  button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
  img{max-width:100%;display:block}
  :focus-visible{outline:2px solid ${T.blue};outline-offset:3px;border-radius:6px}

  .wrap{max-width:1320px;margin:0 auto;padding:0 clamp(1.25rem,4vw,3.5rem);position:relative}
  .sec{position:relative;padding:clamp(5.5rem,11vw,10rem) 0;overflow:clip}

  .name-mark{display:inline-block;font-family:${FONT.name};font-weight:340;text-transform:uppercase;line-height:.82;letter-spacing:.03em;background:linear-gradient(100deg,${T.navy} 5%,${T.blue} 60%,${T.sky});-webkit-background-clip:text;background-clip:text;color:transparent;padding:.04em 0}
  .pill{display:inline-flex;align-items:center;gap:.4rem;font-family:${FONT.mono};font-weight:500;font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;padding:.36rem .72rem;border-radius:999px;background:${T.blue};color:#fff}
  .pill-soft{background:${T.tint};color:${T.blueDeep}}
  .mono{font-family:${FONT.mono};text-transform:uppercase;letter-spacing:.04em}
  .cap{font-family:${FONT.mono};font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:${T.muted}}

  /* display: condensed caps, with a serif italic lead-in for contrast.
     Two voices, deliberately unlike each other — that pairing is the whole
     idea, and the condensed face keeps its weight on a dark ground. */
  .disp{font-family:${FONT.display};font-weight:600;text-transform:uppercase;line-height:.84;letter-spacing:.004em;color:${T.ink}}
  .disp em{font-family:${FONT.serif};font-weight:400;font-style:italic;text-transform:none;letter-spacing:-.01em;color:${T.blue}}
  .hook{display:inline-block;width:.42em;height:.082em;min-height:2px;margin:0 .34em .17em 0;border-radius:.04em;background:${T.blue};vertical-align:middle}
  .hook-row{width:1.1em;height:.1em;margin-right:.5em}

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
  .pcard-art{position:relative;border-radius:18px;background:${T.surface};border:1px solid ${T.line};overflow:hidden;aspect-ratio:10/8;display:grid;place-items:center;padding:8%;transition:border-color .3s ease}
  .pcard-art .wipe-art{width:100%}
  .pcard-scan{position:absolute;left:-30%;top:0;bottom:0;width:30%;background:linear-gradient(90deg,transparent,${blueA(0.12)},transparent);transform:translate3d(0,0,0);transition:transform .9s ${EASE.out};pointer-events:none}
  .pcard:hover .pcard-art{border-color:${T.ice}}
  .pcard:hover .pcard-scan{transform:translate3d(470%,0,0)}
  .pcard-mock{transition:transform .8s ${EASE.out}}
  .pcard:hover .pcard-mock{transform:scale(1.045)}
  .pcard-name{transition:color .3s ease}
  .pcard:hover .pcard-name{color:${T.blue}}

  .chip{font-family:${FONT.mono};font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;padding:.5rem .85rem;border-radius:999px;border:1px solid ${T.line2};color:${T.body};background:${T.surface};transition:background-color .3s ease,color .3s ease,border-color .3s ease}
  .chip:hover{border-color:${T.blue};color:${T.blue}}
  .chip.on{background:${T.blue};border-color:${T.blue};color:#fff}

  .bar{display:block;height:2px;background:${T.line};border-radius:2px;overflow:hidden}
  .bar i{display:block;height:100%;background:linear-gradient(90deg,${T.navy},${T.blue});transform:scaleX(var(--v,1));transform-origin:left center;transition:transform 1.1s ${EASE.out}}
  .rv:not(.in) .bar i{transform:scaleX(0)}
  .tag{display:inline-flex;font-family:${FONT.mono};font-size:.7rem;padding:.28rem .55rem;border-radius:6px;border:1px solid ${T.line};color:${T.body};background:${T.surface};white-space:nowrap}

  .ghost-btn{display:inline-flex;align-items:center;gap:.6rem;font-weight:500;padding:.85rem 1.3rem;border-radius:999px;border:1px solid ${T.ice};color:${T.navy};background:linear-gradient(180deg,${T.surface},${T.tint});transition:border-color .3s ease,color .3s ease}
  .ghost-btn:hover{border-color:${T.blue};color:${T.blue}}
  .ghost-btn .arr{transition:transform .5s ${EASE.out}}
  .ghost-btn:hover .arr{transform:translate3d(3px,-3px,0)}

  /* chrome in the corners - nothing lies across the reading column */
  .mark{position:fixed;left:clamp(1rem,3vw,2.2rem);top:clamp(.5rem,1.6vh,1rem);padding:.45rem .2rem .45rem 0;z-index:1002;font-family:${FONT.name};font-weight:360;font-size:1.5rem;text-transform:uppercase;letter-spacing:.06em;line-height:1;color:${T.ink};opacity:.9;transition:opacity .3s ease,color .3s ease}
  .mark span{color:${T.blue};margin-left:.18em}
  .mark:hover{opacity:1}
  .mark.hid{opacity:0;pointer-events:none}

  .chrome{position:fixed;right:clamp(1rem,3vw,2.2rem);top:clamp(.75rem,1.9vh,1.2rem);z-index:1002;display:flex;align-items:center;gap:.5rem}
  .chip-btn{display:inline-flex;align-items:center;gap:.45rem;height:36px;padding:0 .95rem;border-radius:999px;border:1px solid ${T.line2};background:${T.surface};color:${T.ink};font-size:.82rem;font-weight:500;box-shadow:${SHADOW.card};transition:border-color .3s ease,color .3s ease,transform .3s ${EASE.out}}
  .chip-btn:hover{border-color:${T.blue};color:${T.blue};transform:translate3d(0,-1px,0)}
  .theme-btn{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;border:1px solid ${T.line2};background:${T.surface};color:${T.ink};box-shadow:${SHADOW.card};transition:border-color .3s ease,color .3s ease}
  .theme-btn:hover{border-color:${T.blue};color:${T.blue}}
  .burger{display:grid;place-content:center;gap:5px;width:36px;height:36px;border-radius:50%;border:1px solid ${T.line2};background:${T.surface};box-shadow:${SHADOW.card};transition:border-color .3s ease}
  .burger:hover{border-color:${T.blue}}
  .burger i{display:block;width:15px;height:1.5px;background:${T.ink};border-radius:2px;transition:transform .45s ${EASE.out},background-color .3s ease}
  .burger.x i:first-child{transform:translate3d(0,3.2px,0) rotate(45deg)}
  .burger.x i:last-child{transform:translate3d(0,-3.2px,0) rotate(-45deg)}

  /* the rail: where you are, and a way to jump */
  .rail{position:fixed;right:clamp(.7rem,1.6vw,1.4rem);top:50%;z-index:1001;display:flex;flex-direction:column;align-items:flex-end;gap:.15rem;transform:translate3d(0,-50%,0)}
  .rail-i{display:flex;align-items:center;justify-content:flex-end;gap:.6rem;height:26px;padding-right:2px;color:${T.muted};transition:color .3s ease}
  .rail-l{font-family:${FONT.mono};font-size:.62rem;letter-spacing:.09em;text-transform:uppercase;opacity:0;transform:translate3d(6px,0,0);transition:opacity .35s ease,transform .45s ${EASE.out};white-space:nowrap}
  .rail-d{position:relative;display:block;width:7px;height:7px;border-radius:50%;background:currentColor;opacity:.42;transition:opacity .3s ease,transform .45s ${EASE.spring}}
  .rail-i:hover{color:${T.blue}}
  .rail-i:hover .rail-l{opacity:1;transform:none}
  .rail-i:hover .rail-d{opacity:1;transform:scale(1.25)}
  .rail-i.on{color:${T.blue}}
  .rail-i.on .rail-d{opacity:1;transform:scale(1.5)}
  .rail-i.on .rail-l{opacity:.75;transform:none}
  @media (max-width:860px){.rail{display:none}}

  .menu{position:fixed;inset:0;z-index:999;background:${T.bg};display:flex;flex-direction:column;transform:translate3d(0,102%,0);transition:transform .8s ${EASE.inOut};overflow:auto}
  .menu.open{transform:none}
  .menu>.wrap{margin-block:auto;padding-top:5rem}
  .menu-link{display:flex;align-items:baseline;gap:1rem;padding:.2rem 0;opacity:0;transform:translate3d(0,40px,0);transition:opacity .6s ${EASE.out},transform .8s ${EASE.out},color .3s ease}
  .menu.open .menu-link{opacity:1;transform:none}
  .menu-link:hover{color:${T.blue}}

  .modal-bg{position:fixed;inset:0;z-index:1100;background:rgba(10,20,50,.38);animation:fade .35s ease both}
  .modal{position:fixed;left:50%;top:50%;z-index:1101;width:min(1040px,calc(100vw - 2rem));max-height:calc(100svh - 3rem);overflow:auto;background:${T.surface};border-radius:22px;box-shadow:0 40px 120px -40px rgba(10,20,50,.6);transform:translate3d(-50%,-50%,0);animation:rise .6s ${EASE.out} both}
  @keyframes fade{from{opacity:0}to{opacity:1}}
  @keyframes rise{from{opacity:0;transform:translate3d(-50%,-46%,0)}to{opacity:1;transform:translate3d(-50%,-50%,0)}}

  .loader{position:fixed;inset:0;z-index:2000;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(180deg,${T.wash} 0%,${T.tint} 60%,${T.bg} 100%);transition:transform 1s ${EASE.inOut}}
  .loader.out{transform:translate3d(0,-101%,0)}

  @media (prefers-reduced-motion: reduce){
    html{scroll-behavior:auto}
    .petal,.orb::after{animation:none!important}
    .bar i{transition:none!important}
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
      {hook && <span className="hook" aria-hidden="true" />}
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

/* ─── THEME ───────────────────────────────────────────────
   The palette lives in CSS variables, so switching themes is one
   attribute write on <html> — no React re-render, no repaint of
   anything that is not actually coloured differently. */
function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch { /* private mode */ }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", RAW[theme].bg);
    try { localStorage.setItem("theme", theme); } catch { /* private mode */ }
  }, [theme]);

  // follow the system until the visitor states a preference
  useEffect(() => {
    let stated = false;
    try { stated = !!localStorage.getItem("theme"); } catch { /* private mode */ }
    if (stated) return undefined;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = (e) => setTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  return [theme, toggle];
}

function ThemeToggle({ theme, toggle }) {
  const dark = theme === "dark";
  return (
    <button
      className="theme-btn"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light" : "Dark"}
    >
      <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4.2" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <line key={a} x1="12" y1="2.6" x2="12" y2="5" transform={`rotate(${a} 12 12)`} />
            ))}
          </>
        ) : (
          <path d="M20 14.2A8.4 8.4 0 1 1 9.8 4a6.8 6.8 0 0 0 10.2 10.2Z" />
        )}
      </svg>
    </button>
  );
}

/* ─── DOCK + MENU ─────────────────────────────────────────── */
/* The chrome sits in the corners instead of across the bottom: a bar there
   covers the thing you are reading, which it was doing over the Experience
   copy. The rail on the right doubles as a position indicator. */
function TopBar({ open, setOpen, go, theme, toggleTheme }) {
  const mark = useRef(null);

  // the wordmark would otherwise sit on top of whatever you scrolled to
  useEffect(() => {
    const el = mark.current;
    if (!el) return undefined;
    const on = () => el.classList.toggle("hid", window.scrollY > window.innerHeight * 0.75);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <>
      <button ref={mark} className="mark" onClick={() => go("top")} aria-label="Back to top">
        Surya<span>J</span>
      </button>
      <nav className="chrome" aria-label="Primary">
        <a className="chip-btn" href="/Surya_J_Resume.pdf" target="_blank" rel="noopener noreferrer">
          Résumé <Arrow up size={12} />
        </a>
        <ThemeToggle theme={theme} toggle={toggleTheme} />
        <button className={`burger${open ? " x" : ""}`} onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>
          <i /><i />
        </button>
      </nav>
    </>
  );
}

/** Chapter rail - a dot per section, the label on hover, the active one lit. */
function Rail({ go, active }) {
  return (
    <nav className="rail" aria-label="Sections">
      {MENU.map(([label, id]) => (
        <button
          key={id}
          className={`rail-i${active === id ? " on" : ""}`}
          onClick={() => go(id)}
          aria-label={label}
          aria-current={active === id ? "true" : undefined}
        >
          <span className="rail-l">{label}</span>
          <span className="rail-d" />
        </button>
      ))}
    </nav>
  );
}

/** Tracks which section the viewport is looking at, for the rail. */
function useActiveSection() {
  const [active, setActive] = useState("top");
  useEffect(() => {
    const ids = MENU.map(([, id]) => id);
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) seen.set(e.target.id, e.intersectionRatio);
      let best = null;
      let ratio = 0;
      for (const id of ids) {
        const r = seen.get(id) || 0;
        if (r > ratio) { ratio = r; best = id; }
      }
      if (best) setActive(best);
    }, { threshold: [0, 0.25, 0.5, 0.75], rootMargin: "-20% 0px -40% 0px" });
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);
  return active;
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
          <span className="pill" style={{ justifySelf: "start" }}>Get in touch</span>
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
function World({ mobile, motion, reduced, ready, theme }) {
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
        <Particles morphRef={morph} visibleRef={visible} mobile={mobile} reduced={reduced} theme={theme} />
      </div>

      <div style={{ position: "relative", zIndex: 1, marginTop: "-100svh" }}>
        {CHAPTERS.map((c, i) => (
          <div key={c.id} id={c.id} className="chapter">
            <div className="wrap" style={{ width: "100%", paddingBottom: mobile ? "20svh" : "22svh" }}>
              <div style={{ maxWidth: mobile ? "100%" : "58%" }}>
                {/* the name: tall, slim stencil capitals */}
                {c.name && ready && (
                  <Reveal dir="up" enabled={motion} delay={0.05} style={{ marginBottom: ".2rem" }}>
                    <span className="name-mark" style={{ fontSize: mobile ? "clamp(4rem,19vw,5.4rem)" : "clamp(5rem,8.4vw,8.6rem)" }}>{c.name}</span>
                  </Reveal>
                )}
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
      if (idx) idx.textContent = i === active ? "—" : `(${String(i + 1).padStart(3, "0")})`;
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
    <section id="services" className="sec" style={{ background: `linear-gradient(180deg,${T.bg} 0%,${T.surface} 30%)` }}>
      <div className="wrap">
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1.3fr", gap: mobile ? "2.4rem" : "4rem", alignItems: "start" }}>
          <div style={{ position: mobile ? "static" : "sticky", top: "18vh" }}>
            <Reveal dir="up" enabled={motion} style={{ marginBottom: "1.4rem" }}><span className="pill">What I do</span></Reveal>
            <Lines lines={["Software,", "→*end to end*"]} motion={motion} style={{ fontSize: mobile ? "3rem" : "clamp(3.4rem,5.6vw,5.6rem)", marginBottom: "1.6rem" }} />
            <Reveal dir="up" delay={0.15} enabled={motion}>
              <p style={{ fontFamily: FONT.sans, fontWeight: 500, fontSize: mobile ? "1.3rem" : "1.55rem", lineHeight: 1.4, color: T.text, maxWidth: "34ch", letterSpacing: "-.01em" }}>
                <span className="hook hook-row" aria-hidden="true" />
                From the Android app in someone's pocket to the service tracking a fleet in real time — designed, built and shipped.
              </p>
            </Reveal>
          </div>

          <div ref={ref}>
            {SERVICES.map(([name, stack], i) => (
              <div key={name} ref={(el) => { rows.current[i] = el; }} className="svc" data-d={motion ? String(Math.min(3, i)) : "0"} style={{ borderTop: `1px solid ${T.line}` }}>
                <span className="svc-i">{i === 0 ? "—" : `(${String(i + 1).padStart(3, "0")})`}</span>
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
    <section id="experience" className="sec" style={{ background: T.surface }}>
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
                  <span className="row-t" style={{ fontFamily: FONT.display, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".01em", fontSize: mobile ? "2.1rem" : "clamp(2.2rem,3.6vw,3.3rem)", lineHeight: 1, color: T.ink }}>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: mobile ? "1.2rem" : "1.6rem 2rem", borderBottom: `1px solid ${T.line}`, position: "sticky", top: 0, background: T.surface, zIndex: 1 }}>
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
            <p style={{ color: T.muted, marginBottom: project.org ? "1.1rem" : "1.6rem" }}>{project.tag}</p>
            {project.org && ORGS[project.org] && (
              <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: mobile ? ".55rem" : ".7rem", alignItems: "flex-start", padding: ".9rem 1rem", marginBottom: "1.6rem", borderRadius: 12, background: T.tint }}>
                <span className="pill" style={{ flexShrink: 0 }}>{ORGS[project.org].relation}</span>
                <span>
                  <span style={{ fontWeight: 600, color: T.ink }}>{project.org}</span>
                  <span style={{ display: "block", fontSize: ".88rem", lineHeight: 1.55, color: T.body, marginTop: ".15rem" }}>
                    {ORGS[project.org].blurb}
                  </span>
                </span>
              </div>
            )}
            {[["The problem", project.problem], ["The design", project.highlight], ["The outcome", project.power]].map(([k, v]) => (
              <div key={k} style={{ borderTop: `1px solid ${T.line}`, padding: "1rem 0" }}>
                <div className="cap" style={{ color: T.blue, marginBottom: ".4rem" }}>{k}</div>
                <p style={{ lineHeight: 1.7, color: T.text }}>{v}</p>
              </div>
            ))}
            {project.variants && (
              <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: "1rem" }}>
                <div className="cap" style={{ color: T.blue, marginBottom: ".8rem" }}>Also deployed as</div>
                {project.variants.map((v) => (
                  <div key={v.name} style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "auto 1fr", gap: mobile ? ".45rem" : ".8rem", alignItems: "start", paddingBottom: ".9rem" }}>
                    <span className="pill pill-soft" style={{ whiteSpace: "nowrap" }}>{v.org}</span>
                    <span>
                      <span style={{ fontWeight: 600, color: T.ink }}>{v.name}</span>
                      <span style={{ display: "block", lineHeight: 1.65, color: T.body, marginTop: ".2rem" }}>{v.note}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
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
    <section id="projects" className="sec" style={{ background: T.bg }}>
      <div className="wrap">
        {/* "SOME   of my / PROJECTS" — the split-line heading */}
        <div className="disp" style={{ fontSize: mobile ? "3.2rem" : "clamp(4rem,8vw,8.4rem)", marginBottom: mobile ? "1.6rem" : "2rem" }}>
          <Lines lines={["Some"]} motion={motion} as="div" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1rem", flexWrap: "wrap" }}>
            <Lines lines={["→projects"]} motion={motion} as="div" delay={0.1} />
            <Lines lines={["*of my own*"]} motion={motion} as="div" delay={0.2} />
          </div>
        </div>
        <Decode text={`A selection of ${PROJECTS.length}: client platforms, products and experiments. Open any one for the problem, the design decision and a schematic.`} enabled={motion} className="mono" style={{ fontSize: ".78rem", lineHeight: 1.6, color: T.navy, maxWidth: "58ch", marginBottom: "2.4rem" }} />

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
                <div className="pcard-name" style={{ fontFamily: FONT.display, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".012em", fontSize: mobile ? "1.9rem" : "2.1rem", lineHeight: 1.02, color: T.ink, marginTop: ".4rem" }}>{p.name}</div>
                <div className="mono pcard-for" style={{ fontSize: ".66rem", color: p.org ? T.blue : T.faint, marginTop: ".35rem" }}>
                  {p.org ? `For ${p.org}` : "Personal project"}
                  {/* two children for the same brand should not say it twice */}
                  {p.variants && [...new Set(p.variants.map((v) => v.org))].map((o) => (
                    <span key={o} style={{ color: T.muted }}> + {o}</span>
                  ))}
                </div>
              </button>
            </Reveal>
          ))}
        </FXGrid>
      </div>
      <ProjectModal project={active} onClose={close} mobile={mobile} />
    </section>
  );
}

/* ─── BACKGROUND — education, stack, principles ───────────── */
function Background({ mobile, motion }) {
  const groups = useMemo(() => {
    const by = new Map();
    for (const s of SKILL_BARS) {
      if (!by.has(s.cat)) by.set(s.cat, []);
      by.get(s.cat).push(s);
    }
    return [...by.entries()];
  }, []);

  return (
    <section id="background" className="sec" style={{ background: T.surface }}>
      <div className="wrap">
        <Lines lines={["Education *&*", "→the stack"]} motion={motion} style={{ fontSize: mobile ? "2.8rem" : "clamp(3.4rem,6.6vw,6.6rem)", marginBottom: "1.4rem" }} />
        <Decode text="Where I studied, what I build with, and the rules I hold myself to." enabled={motion} className="mono" style={{ fontSize: ".78rem", lineHeight: 1.6, color: T.navy, maxWidth: "52ch", marginBottom: "3rem" }} />

        {/* education */}
        {EDUCATION.map((e) => (
          <Reveal key={e.degree} dir="up" enabled={motion} style={{ borderTop: `1px solid ${T.ink}`, paddingTop: "1.4rem", marginBottom: "3.4rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.4fr 1fr", gap: mobile ? "1rem" : "2rem", alignItems: "start" }}>
              <div>
                <h3 style={{ fontFamily: FONT.display, fontWeight: 600, textTransform: "uppercase", fontSize: mobile ? "2rem" : "2.7rem", lineHeight: 1, color: T.ink, letterSpacing: ".008em" }}>{e.degree}</h3>
                <p style={{ ...TYPE.body, marginTop: ".5rem" }}>{e.school} · {e.place}</p>
                <p style={{ ...TYPE.body, marginTop: ".8rem", maxWidth: "52ch" }}>{e.note}</p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", justifyContent: mobile ? "flex-start" : "flex-end" }}>
                <span className="pill pill-soft">{e.when}</span>
                <span className="pill">{e.score}</span>
              </div>
            </div>
          </Reveal>
        ))}

        {/* the stack, by group, with a bar that draws in */}
        <Reveal dir="up" enabled={motion} style={{ display: "flex", alignItems: "baseline", gap: ".5rem", borderTop: `1px solid ${T.ink}`, paddingTop: "1rem", marginBottom: "1.6rem" }}>
          <span style={{ fontWeight: 600, letterSpacing: ".02em" }}>STACK</span>
          <span className="mono" style={{ fontSize: ".7rem", color: T.muted }}>[{String(SKILL_BARS.length).padStart(2, "0")}]</span>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, minmax(0,1fr))", gap: mobile ? "1.8rem" : "2rem 3rem", marginBottom: "3.4rem" }}>
          {groups.map(([cat, list], gi) => (
            <Reveal key={cat} dir="up" delay={(gi % 3) * 0.06} enabled={motion}>
              <p className="cap" style={{ marginBottom: ".9rem" }}>{cat}</p>
              {list.map((s) => (
                <div key={s.name} style={{ marginBottom: ".85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1rem", marginBottom: ".3rem" }}>
                    <span style={{ fontSize: ".95rem", color: T.text }}>{s.name}</span>
                    <span className="mono" style={{ fontSize: ".66rem", color: T.faint }}>{s.level}</span>
                  </div>
                  <span className="bar"><i style={{ "--v": s.level / 100 }} /></span>
                </div>
              ))}
            </Reveal>
          ))}
        </div>

        {/* principles and what's next, side by side */}
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? "2.6rem" : "3rem" }}>
          <div>
            <Reveal dir="up" enabled={motion} style={{ display: "flex", alignItems: "baseline", gap: ".5rem", borderTop: `1px solid ${T.ink}`, paddingTop: "1rem", marginBottom: "1.4rem" }}>
              <span style={{ fontWeight: 600, letterSpacing: ".02em" }}>PRINCIPLES</span>
              <span className="mono" style={{ fontSize: ".7rem", color: T.muted }}>[{String(PHILOSOPHY.length).padStart(2, "0")}]</span>
            </Reveal>
            {PHILOSOPHY.map((p, i) => (
              <Reveal key={p.n} dir="up" delay={i * 0.05} enabled={motion} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "1rem", padding: ".9rem 0", borderTop: `1px solid ${T.line}` }}>
                <span className="mono" style={{ fontSize: ".7rem", color: T.blue }}>{p.n}</span>
                <div>
                  <p style={{ ...TYPE.h3(mobile) }}>{p.t}</p>
                  <p style={{ ...TYPE.body, fontSize: ".92rem", marginTop: ".3rem" }}>{p.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div>
            <Reveal dir="up" enabled={motion} style={{ display: "flex", alignItems: "baseline", gap: ".5rem", borderTop: `1px solid ${T.ink}`, paddingTop: "1rem", marginBottom: "1.4rem" }}>
              <span style={{ fontWeight: 600, letterSpacing: ".02em" }}>WHAT&rsquo;S NEXT</span>
              <span className="mono" style={{ fontSize: ".7rem", color: T.muted }}>[{String(GOALS.length).padStart(2, "0")}]</span>
            </Reveal>
            {GOALS.map((g, i) => (
              <Reveal key={g.n} dir="up" delay={i * 0.05} enabled={motion} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "1rem", padding: ".9rem 0", borderTop: `1px solid ${T.line}` }}>
                <span className="mono" style={{ fontSize: ".7rem", color: T.blue }}>{g.n}</span>
                <div>
                  <p style={{ ...TYPE.h3(mobile) }}>{g.t}</p>
                  <p style={{ ...TYPE.body, fontSize: ".92rem", marginTop: ".3rem" }}>{g.b}</p>
                </div>
              </Reveal>
            ))}

            <Reveal dir="up" enabled={motion} style={{ marginTop: "2rem" }}>
              <p className="cap" style={{ marginBottom: ".8rem" }}>Interests</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
                {INTERESTS.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CREDENTIALS — an awards-style table ─────────────────── */
function Credentials({ mobile, motion }) {
  const [open, setOpen] = useState(-1);
  return (
    <section id="credentials" className="sec" style={{ background: T.surface }}>
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
                <span className="row-t" style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: mobile ? "1.1rem" : "1.25rem", letterSpacing: "-.01em", color: T.ink }}>
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
            <span style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: mobile ? "1.1rem" : "1.25rem", letterSpacing: "-.01em", color: T.ink }}>{a.title}</span>
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
    <section id="contact" className="sec" style={{ background: `linear-gradient(180deg,${T.surface} 0%,${T.tint} 100%)`, paddingBottom: "12rem" }}>
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
  const [theme, toggleTheme] = useTheme();
  const active = useActiveSection();
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
      <style>{THEME_CSS + CSS + MOTION_CSS + FX_CSS}</style>
      <Loader onDone={onLoaded} reduced={reduced} />
      <ScrollBar />

      <main>
        <World mobile={mobile} motion={motion} reduced={reduced} ready={ready} theme={theme} />
        <Services mobile={mobile} motion={motion} />
        <Experience mobile={mobile} motion={motion} />
        <Background mobile={mobile} motion={motion} />
        <Projects mobile={mobile} motion={motion} />
        <Credentials mobile={mobile} motion={motion} />
        <Contact mobile={mobile} motion={motion} />
      </main>

      {/* cursor smoke: above the page, below the chrome, menu and modals */}
      <Smoke />
      <Menu open={menu} go={go} mobile={mobile} />
      <TopBar open={menu} setOpen={setMenu} go={go} theme={theme} toggleTheme={toggleTheme} />
      <Rail go={go} active={active} />

      <Analytics />
      <SpeedInsights />
    </>
  );
}
