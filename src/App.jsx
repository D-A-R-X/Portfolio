import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import { CERT_IMAGES } from "./assets.js";
import { T, FONT, TYPE, SHADOW, EASE, blueA, THEME_CSS, RAW } from "./theme.js";
import { CONTACT_LINKS, EXPERIENCE, EDUCATION, SKILL_BARS, PROJECTS, PROJECT_FILTERS, ORGS, CERTS, ACHIEVEMENTS, INTERESTS, PHILOSOPHY, GOALS } from "./data.js";
import { useReducedMotion, useIsMobile, useScrubber, useReveal, Reveal, Decode, Magnetic, MOTION_CSS } from "./motion.jsx";
import { Landscape, Particles } from "./world.jsx";
import { Smoke } from "./fluid.jsx";
import { CarScene, CAR_CSS } from "./car.jsx";
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
  { id: "drive", pill: "Off the clock", lines: ["*Away from*", "the keyboard,", "it's cars"], mono: "An M5 CS, in the browser. Open the doors, lift the bonnet, let it run." },
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

/* The car lies under the whole page and the scroll is its camera, so the
   sections that carry a colour let a little of it through rather than
   sealing it off. Enough to read over, not enough to hide behind. */
const veil = (c) => `color-mix(in srgb, ${c} 42%, transparent)`;
const COLUMN = 1000;   // the width at which content moves into its own column

/* ─── CSS ─────────────────────────────────────────────────── */
const CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  html{background:#05080f;scroll-behavior:smooth;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;overflow-x:clip}
  body{background:#05080f;color:${T.ink};font-family:${FONT.sans};overflow-x:clip}
  ::selection{background:${T.blue};color:${T.surface}}
  a{color:inherit;text-decoration:none}
  button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
  img{max-width:100%;display:block}
  :focus-visible{outline:2px solid ${T.blue};outline-offset:3px;border-radius:6px}

  .wrap{max-width:1320px;margin:0 auto;padding:0 clamp(1.25rem,4vw,3.5rem);position:relative}
  .sec{position:relative;padding:clamp(2.6rem,5vw,4.2rem) 0;overflow:clip;background:transparent}
  /* thin glass, not a slab: enough to read over, little enough that the
     shed and the car stay legible straight through it */
  .sec > .wrap{background:${veil(T.surface)};border:1px solid color-mix(in srgb,#38bdf8 22%,transparent);
    border-radius:18px;padding-block:clamp(1.8rem,3.4vw,3rem);
    box-shadow:0 20px 60px -30px rgba(0,0,0,.75);
    backdrop-filter:blur(22px) saturate(1.15);-webkit-backdrop-filter:blur(22px) saturate(1.15)}

  /* Above COLUMN the page becomes a rail of content down one side and the
     shed keeps the rest of the window, which is the only way the camera
     work is ever actually seen. */
  @media (min-width:${COLUMN}px){
    main{width:min(34rem,38vw);margin-left:clamp(1.5rem,4vw,4rem)}
    .hero-shed{height:100svh}
    .sec > .wrap{padding-inline:clamp(1.4rem,2vw,2rem)}
    .plate{left:auto;right:0;width:min(34rem,38vw)}
  }

  /* the opening chapter is centred on its own axis; everything after it
     stays flush left, where long lines are easier to read */
  .ch-open .hook{display:none}
  .ch-open .sw-w{justify-content:center}
  .ch-open .mono{margin-inline:auto}

  /* the name the particles draw; shown only when the scene cannot run */
  .name-alt{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
  .no-scene .name-alt{position:static;width:auto;height:auto;margin:0 auto .4rem;clip-path:none;display:block;font-family:${FONT.name};font-weight:360;font-size:clamp(3.4rem,13vw,7rem);text-transform:uppercase;letter-spacing:.05em;line-height:.9;color:${T.ink}}

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
  .parts{position:absolute;inset:0;opacity:0;transition:opacity 1.2s ease .2s}
  .parts.in{opacity:1}
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
  .pcard-art{position:relative;border-radius:18px;background:${T.surface};border:1px solid ${T.line};overflow:hidden;aspect-ratio:10/8;display:grid;place-items:center;padding:11%;transition:border-color .3s ease}
  .pcard-art .wipe-art{width:100%}
  .pcard:hover .pcard-art{border-color:${T.ice}}
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




  .menu{position:fixed;inset:0;z-index:999;background:${T.bg};display:flex;flex-direction:column;transform:translate3d(0,102%,0);transition:transform .8s ${EASE.inOut};overflow:auto}
  .menu.open{transform:none}
  .menu>.wrap{margin-block:auto;padding-top:5rem}
  .menu-link{display:flex;align-items:baseline;gap:1rem;padding:.2rem 0;opacity:0;transform:translate3d(0,40px,0);transition:opacity .6s ${EASE.out},transform .8s ${EASE.out},color .3s ease}
  .menu.open .menu-link{opacity:1;transform:none}
  .menu-link:hover{color:${T.blue}}

  @keyframes fade{from{opacity:0}to{opacity:1}}
  @keyframes rise{from{opacity:0;transform:translate3d(-50%,-46%,0)}to{opacity:1;transform:translate3d(-50%,-50%,0)}}

  .loader-veil{position:absolute;inset:0;background:#05080f;opacity:.34}
  .loader{position:fixed;inset:0;z-index:2000;display:flex;flex-direction:column;align-items:center;justify-content:center;background:transparent;transition:transform 1s ${EASE.inOut}}
  .loader.out{transform:translate3d(0,-101%,0)}
  /* the hero text rises as the camera comes in through the haze */
  .loader-sub{font-size:.68rem;letter-spacing:.17em;text-transform:uppercase;color:#9fc6e8;
    margin-top:1rem;text-align:center;animation:loaderRise 1.1s ${EASE.out} .25s both}
  .loader-bio{max-width:40rem;margin:1.6rem auto 0;padding:0 1.5rem;text-align:center;
    font-size:clamp(.82rem,1.5vw,.95rem);line-height:1.7;color:#b9ccdf;
    animation:loaderRise 1.2s ${EASE.out} .5s both}
  .loader-bar{width:min(220px,50vw);height:1px;margin-top:2.4rem;overflow:hidden;
    background:rgba(146,180,224,.22);animation:loaderRise 1s ${EASE.out} .8s both}
  .loader-bar i{display:block;height:100%;background:#38bdf8;transform-origin:left;
    box-shadow:0 0 10px rgba(56,189,248,.9)}
  @keyframes loaderRise{from{opacity:0;transform:translate3d(0,16px,0)}to{opacity:1;transform:none}}

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
function Loader({ onDone, reduced, hold }) {
  const [n, setN] = useState(0);
  const [out, setOut] = useState(false);
  const [gone, setGone] = useState(reduced);
  const done = useRef(onDone);
  done.current = onDone;
  const held = useRef(hold);
  held.current = hold;

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
    // timers, not rAF, own the exit — it must happen even if frames stall.
    // The car's entrance plays behind this panel, so the exit waits for it,
    // but never longer than CAP: a model that fails to load must not strand
    // anyone on a loading screen.
    const CAP = 9000;
    let a = 0, b = 0;
    const finish = () => {
      setN(100);
      setOut(true);
      done.current();
      b = setTimeout(() => setGone(true), 1100);
    };
    const waitForCar = (started) => {
      if (!held.current || performance.now() - started > CAP) { finish(); return; }
      a = setTimeout(() => waitForCar(started), 120);
    };
    a = setTimeout(() => waitForCar(performance.now()), DUR + 150);
    return () => { cancelAnimationFrame(raf); clearTimeout(a); clearTimeout(b); };
  }, [reduced]);

  if (gone) return null;
  return (
    <div className={`loader${out ? " out" : ""}`} aria-hidden="true">
      <span className="loader-veil" />
      <div style={{ fontFamily: FONT.serif, fontSize: "clamp(2.6rem,6vw,4rem)", color: "#eaf4ff", letterSpacing: "-.01em", textShadow: "0 0 26px rgba(56,189,248,.45)" }}>
        Surya <em style={{ color: T.blue }}>J</em>
      </div>
      <div className="mono loader-sub">Software developer &amp; hardcore car enthusiast</div>
      <p className="loader-bio">
        Software developer by profession, hardcore car enthusiast by obsession. I build
        high-performance web and mobile systems with the same precision, speed and
        architecture tuning that goes into an M-Power V8.
      </p>
      <div className="loader-bar"><i style={{ transform: `scaleX(${n / 100})` }} /></div>
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
        <div className={`parts${ready ? " in" : ""}`}><Particles morphRef={morph} visibleRef={visible} mobile={mobile} reduced={reduced} theme={theme} /></div>
      </div>

      <div style={{ position: "relative", zIndex: 1, marginTop: "-100svh" }}>
        {CHAPTERS.map((c, i) => (
          <div key={c.id} id={c.id} className="chapter">
            <div className="wrap" style={{ width: "100%", paddingBottom: mobile ? "20svh" : "22svh" }}>
              <div
                className={i === 0 ? "ch-open" : undefined}
                style={i === 0
                  ? { maxWidth: mobile ? "100%" : "min(100%, 54rem)", marginInline: "auto", textAlign: "center" }
                  : { maxWidth: mobile ? "100%" : "58%" }}
              >
                {/* the particles spell the name; this stays for screen readers
                    and for anyone whose browser cannot run the scene */}
                {c.name && <h1 className="name-alt">{c.name}</h1>}
                {c.pill && <Reveal dir="up" enabled={motion} style={{ marginBottom: "1.3rem" }}><span className="pill">{c.pill}</span></Reveal>}
                {(i > 0 || ready) && (
                  <Lines
                    as="h2"
                    lines={c.lines}
                    motion={motion}
                    delay={i === 0 ? 0.05 : 0}
                    style={{ fontSize: mobile ? "clamp(2.9rem,13vw,4.2rem)" : "clamp(3.6rem,7.2vw,7.4rem)" }}
                  />
                )}
                {c.caption && (i > 0 || ready) && (
                  <Decode as="p" text={c.caption} enabled={motion} className="mono" style={{ fontSize: ".74rem", color: T.navy, marginTop: "1.4rem", maxWidth: "40ch" }} />
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

  // The row in focus is the one nearest the middle of whatever is scrolling
  // it: the dossier now, not the window, which never moves. Rows are read
  // once per scroll frame and only rows whose distance bucket changed are
  // written.
  const ref = useRef(null);
  useEffect(() => {
    const list = ref.current;
    if (!list || !motion) return undefined;
    const body = list.closest(".panel-body");
    const source = body || window;
    let raf = 0;
    const step = () => {
      raf = 0;
      const box = body ? body.getBoundingClientRect() : { top: 0, height: window.innerHeight };
      const mid = box.top + box.height * 0.45;
      let active = 0, best = Infinity;
      rows.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < best) { best = d; active = i; }
      });
      if (active === last.current) return;
      last.current = active;
      rows.current.forEach((el, i) => {
        if (!el) return;
        const d = String(Math.min(3, Math.abs(i - active)));
        if (el.dataset.d !== d) el.dataset.d = d;
        const idx = el.firstChild;
        if (idx) idx.textContent = i === active ? "—" : `(${String(i + 1).padStart(3, "0")})`;
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(step); };
    source.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    step();
    return () => {
      source.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [motion]);

  return (
    <section id="services" className="sec">
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
    <section id="experience" className="sec">
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
                  <span className="row-t" style={{ fontFamily: FONT.sans, fontWeight: 600, letterSpacing: "-.015em", fontSize: mobile ? "1.5rem" : "clamp(1.6rem,2.4vw,2.1rem)", lineHeight: 1.15, color: T.ink }}>
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

/* ─── PROJECT DRILLDOWN ─────────────────────────────────────
   A project opens inside the dock, not over the page: the list slides out
   to the left and the project slides in, in the same glass, so the car on
   the right is never covered. The list stays where it was underneath, so
   the camera does not move and Back lands on the same card. */
const LINK_LABEL = { GitHub: "View source repo", "Play Store": "Open on Play Store" };

function ProjectDrill({ project, onClose, total }) {
  const back = useRef(null);
  const pane = useRef(null);
  // the last project stays rendered through the exit slide
  const [shown, setShown] = useState(project);
  useEffect(() => { if (project) setShown(project); }, [project]);
  const host = typeof document !== "undefined" ? document.querySelector(".panel") : null;

  useEffect(() => {
    if (!host) return undefined;
    host.classList.toggle("drill", !!project);
    if (!project) return undefined;
    const prev = document.activeElement;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    window.addEventListener("drill:close", onClose);
    if (pane.current) pane.current.scrollTop = 0;
    // a frame later: the button is only focusable once the slide has made it visible
    const f = requestAnimationFrame(() => { if (back.current) back.current.focus({ preventScroll: true }); });
    return () => {
      cancelAnimationFrame(f);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("drill:close", onClose);
      if (prev && prev.focus) prev.focus({ preventScroll: true });
    };
  }, [project, onClose, host]);
  useEffect(() => () => { if (host) host.classList.remove("drill"); }, [host]);

  if (!host || !shown) return null;
  const p = shown;
  const index = String(PROJECTS.indexOf(p) + 1).padStart(2, "0");
  const orgs = p.org ? [p.org, ...new Set((p.variants || []).map((v) => v.org).filter((o) => o !== p.org))] : [];
  const rows = [
    ["01", "The problem", p.problem],
    ["02", "Design decision", p.highlight],
    ["03", "Architecture & outcome", p.power],
  ];

  return createPortal(
    <div className="pdetail" ref={pane} role="region" aria-label={`${p.name}, project details`}>
      <div className="pd-col">
        <div className="pd-bar">
          <button ref={back} className="pd-back mono" onClick={onClose}>
            <i aria-hidden="true">&larr;</i> Back to {total} projects
          </button>
          <span className="pd-meta mono">
            <span className="pd-index">{index} / {String(PROJECTS.length).padStart(2, "0")}</span>
            <span className="pd-client">{orgs.length ? `For ${orgs.join(" + ")}` : "Personal project"}</span>
          </span>
        </div>

        <div className="pd-head">
          <div>
            <h3 className="pd-title">{p.name}</h3>
            <p className="pd-tag">{p.tag}</p>
            <div className="pd-stack">
              {p.stack.map((t) => <span key={t} className="mono">{t}</span>)}
            </div>
          </div>
          <div className="pd-schem" aria-hidden="true"><Mockup kind={p.mock} width="100%" draw /></div>
        </div>

        {rows.map(([n, k, v]) => (
          <div key={n} className="pd-row">
            <div className="pd-label mono">[ {n} // {k} ]</div>
            <p>{v}</p>
          </div>
        ))}

        {p.org && ORGS[p.org] && (
          <div className="pd-row">
            <div className="pd-label mono">[ {ORGS[p.org].relation} ]</div>
            <p><strong>{p.org}</strong> &mdash; {ORGS[p.org].blurb}</p>
          </div>
        )}
        {p.variants && (
          <div className="pd-row">
            <div className="pd-label mono">[ Also deployed as ]</div>
            {p.variants.map((v) => (
              <p key={v.name} className="pd-variant"><strong>{v.name}</strong> <span className="mono">{v.org}</span><br />{v.note}</p>
            ))}
          </div>
        )}

        <div className="pd-foot">
          {p.repo
            ? <a className="pd-cta mono" href={p.repo} target="_blank" rel="noopener noreferrer">{LINK_LABEL[p.repoLabel] || p.repoLabel} <span aria-hidden="true">&#8599;</span></a>
            : <span className="pd-private mono">Private &middot; {p.repoLabel}{p.org ? ` · ${p.org}` : ""}</span>}
        </div>
      </div>
    </div>,
    host,
  );
}

/* ─── PROJECTS ────────────────────────────────────────────── */
function Projects({ mobile, motion }) {
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState(null);
  const close = useCallback(() => setActive(null), []);
  const list = useMemo(() => (filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.cat === filter)), [filter]);
  const cols = mobile ? 1 : 3;

  return (
    <section id="projects" className="sec">
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
                    <div className="wipe-art"><div className="pcard-mock"><Mockup kind={p.mock} width="100%" draw /></div></div>
                  </div>
                </FXArt>
                <div className="mono" style={{ fontSize: ".68rem", color: T.muted, marginTop: "1rem" }}>{p.stack.slice(0, 2).join(" / ")}</div>
                <div className="pcard-name" style={{ fontFamily: FONT.sans, fontWeight: 600, letterSpacing: "-.015em", fontSize: mobile ? "1.3rem" : "1.4rem", lineHeight: 1.25, color: T.ink, marginTop: ".55rem" }}>{p.name}</div>
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
      <ProjectDrill project={active} onClose={close} total={list.length} />
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
    <section id="background" className="sec">
      <div className="wrap">
        <Lines lines={["Education *&*", "→the stack"]} motion={motion} style={{ fontSize: mobile ? "2.8rem" : "clamp(3.4rem,6.6vw,6.6rem)", marginBottom: "1.4rem" }} />
        <Decode text="Where I studied, what I build with, and the rules I hold myself to." enabled={motion} className="mono" style={{ fontSize: ".78rem", lineHeight: 1.6, color: T.navy, maxWidth: "52ch", marginBottom: "3rem" }} />

        {/* education */}
        {EDUCATION.map((e) => (
          <Reveal key={e.degree} dir="up" enabled={motion} style={{ borderTop: `1px solid ${T.ink}`, paddingTop: "1.4rem", marginBottom: "3.4rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.4fr 1fr", gap: mobile ? "1rem" : "2rem", alignItems: "start" }}>
              <div>
                <h3 style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: mobile ? "1.5rem" : "1.9rem", lineHeight: 1.2, color: T.ink, letterSpacing: "-.015em" }}>{e.degree}</h3>
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
    <section id="credentials" className="sec">
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
    <section id="contact" className="sec" style={{ paddingBottom: "2.5rem" }}>
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
          <span className="cap">Chennai, India</span>
        </div>
      </div>
    </section>
  );
}

/* ─── PAGE ────────────────────────────────────────────────── */

/* ─── THE GARAGE SHELL ────────────────────────────────────────
   The car is the navigation. A part of it opens a drawer holding the
   section that part stands for — the same components the scrolling site
   used, so none of the writing or the layout work is lost. */
const SECTIONS = {
  services: "What I do",
  experience: "Experience",
  background: "Background",
  projects: "Projects",
  credentials: "Credentials",
  contact: "Contact",
};

/* What the overview says, since the car cannot introduce itself. */
function Plate({ shown }) {
  return (
    <div className={`plate${shown ? " in" : ""}`} aria-hidden={!shown}>
      <h1 className="plate-name">SURYA J</h1>
      <p className="plate-role mono">SOFTWARE DEVELOPER · ANDROID, WEB &amp; BACKEND</p>
      <p className="plate-hint mono">Scroll to drive · tap a pin to open it</p>
    </div>
  );
}

/* The panel. The pins carry a line each; this is where the actual work is
   written up. Same section components the scrolling site used, so nothing
   written has been lost along the way. */
/* The dossier. Permanently open: the left of the window is what you read,
   the right is the car, and this panel's own scroll is what drives the tour
   round it. */
function Panel({ mobile, motion, progressRef, shown }) {
  const body = useRef(null);
  const rail = useRef(null);

  // One rAF per scroll burst, writing straight to the DOM and to a ref the
  // render loop reads. A React state update per scroll pixel is what makes
  // a page like this stutter.
  useEffect(() => {
    const el = body.current;
    if (!el) return undefined;
    let raf = 0;
    let queued = false;
    const root = document.documentElement;
    // the runway is one dossier-height: the content starts just out of sight
    let runway = el.clientHeight;
    const measure = () => {
      runway = el.clientHeight;
      el.style.setProperty("--runway", `${runway}px`);
    };
    measure();

    // --k follows the scroll through the runway, eased toward it each frame
    // so a wheel's 100px steps glide instead of jumping
    let kNow = 0, kWant = 0, kRaf = 0, kLast = 0;
    const glide = (t) => {
      const dt = kLast ? Math.min(0.05, (t - kLast) / 1000) : 0.016;
      kLast = t;
      kNow += (kWant - kNow) * Math.min(1, dt * 9);
      if (Math.abs(kWant - kNow) < 0.0008) kNow = kWant;
      root.style.setProperty("--k", kNow.toFixed(4));
      if (kNow > 0.5) root.classList.add("lifted");
      else if (kNow < 0.4) root.classList.remove("lifted");
      kRaf = kNow === kWant ? 0 : requestAnimationFrame(glide);
      if (!kRaf) kLast = 0;
    };

    const draw = () => {
      queued = false;
      // the tour starts once the dossier has arrived, not while it is rising
      const run = el.scrollHeight - el.clientHeight - runway;
      const at = run > 4 ? Math.min(1, Math.max(0, (el.scrollTop - runway) / run)) : 0;
      if (progressRef) progressRef.current = at;
      document.documentElement.classList.toggle("scrolled", el.scrollTop > runway * 0.5);
      kWant = Math.min(1, Math.max(0, el.scrollTop / (runway * 0.85)));
      if (!kRaf) kRaf = requestAnimationFrame(glide);
      if (rail.current) rail.current.style.transform = `scaleY(${Math.max(0.06, at).toFixed(3)})`;
    };
    window.addEventListener("resize", measure, { passive: true });
    const onScroll = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(draw);
    };

    // The window itself does not scroll, so a wheel over the car reached
    // nothing and the tour looked frozen. Anything outside the dossier is
    // forwarded into it, which is what a split screen should do.
    const onWheel = (ev) => {
      if (!shown) { ev.preventDefault(); return; }
      if (ev.target.closest && ev.target.closest(".panel")) return;
      if (ev.ctrlKey) return;                       // leave pinch-zoom alone
      // while a project is open, the wheel scrolls the project, not the list
      const dock = el.parentElement;
      const into = dock && dock.classList.contains("drill") ? dock.querySelector(".pdetail") || el : el;
      into.scrollTop += ev.deltaY;
      ev.preventDefault();
    };
    window.addEventListener("wheel", onWheel, { passive: false });

    // On a phone the dossier starts below the screen, so a swipe over the
    // car has nothing under it to scroll. Same forwarding, for fingers.
    let lastY = null;
    const onTouchStart = (ev) => {
      lastY = ev.target.closest && ev.target.closest(".panel") ? null : ev.touches[0].clientY;
    };
    const onTouchMove = (ev) => {
      if (lastY === null || !shown || ev.touches.length > 1) return;
      const y = ev.touches[0].clientY;
      const dock = el.parentElement;
      const into = dock && dock.classList.contains("drill") ? dock.querySelector(".pdetail") || el : el;
      into.scrollTop += lastY - y;
      lastY = y;
      ev.preventDefault();
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    el.scrollTop = 0;
    draw();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(kRaf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      cancelAnimationFrame(raf);
    };
  }, [progressRef, shown]);

  return (
    <aside className={`panel${shown ? " open" : ""}`} aria-label="Portfolio">
      <span className="panel-rail" aria-hidden="true"><i ref={rail} /></span>
      <div className="panel-body" ref={body}>
        <div className="runway" aria-hidden="true" />
        <header className="dossier">
          <span className="dossier-m" aria-hidden="true"><i /><i /><i /></span>
          <h1 className="dossier-name sr-only">Surya J</h1>
          <p className="dossier-role mono">Software developer &middot; Android, web &amp; backend</p>
          <p className="dossier-line">
            Software developer by profession, <em className="carlove">hardcore car enthusiast</em> by obsession. I build
            high-performance web and mobile systems with the same precision, speed and
            architecture tuning that goes into an M-Power V8.
          </p>
          <p className="dossier-hint mono">Scroll &mdash; the car follows</p>
        </header>
        <Services mobile motion={motion} />
        <Experience mobile motion={motion} />
        <Background mobile motion={motion} />
        <Projects mobile motion={motion} />
        <Credentials mobile motion={motion} />
        <Contact mobile motion={motion} />
      </div>
    </aside>
  );
}

/* The name. One element, two places: big in the opening titles, small in
   the top-left corner once the dossier is up, and it travels between them
   rather than fading out in one spot and in at another. The corner mark and
   the title name stay in the layout, invisible, purely to say where those
   two places are on this screen. */
function HeroName() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const from = document.querySelector(".introhud-name");
      const to = document.querySelector(".mark");
      if (!from || !to) return;
      const hud = from.offsetParent;
      const b = to.getBoundingClientRect();
      // measured from layout, not from the screen: the titles are often
      // mid-move (rising in, or riding up with the dossier) when this runs
      let ax = from.getBoundingClientRect().left;
      let ay = from.getBoundingClientRect().top;
      if (hud) {
        const h = hud.getBoundingClientRect();
        const t = new DOMMatrix(getComputedStyle(hud).transform);
        ax = h.left - t.m41 + from.offsetLeft;
        ay = h.top - t.m42 + from.offsetTop;
      }
      const big = parseFloat(getComputedStyle(from).fontSize) || 1;
      const small = parseFloat(getComputedStyle(el).fontSize) || 1;
      const scale = big / small;
      const pad = parseFloat(getComputedStyle(el).paddingTop) || 0;
      el.style.setProperty("--ax", `${ax}px`);
      el.style.setProperty("--ay", `${ay - pad * scale}px`);
      el.style.setProperty("--as", scale.toFixed(4));
      el.style.setProperty("--bx", `${b.left}px`);
      el.style.setProperty("--by", `${b.top}px`);
      el.classList.add("ready");
    };
    measure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    const again = setTimeout(measure, 1600);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      clearTimeout(again);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // in the corner it is a way home: back to the top of the dossier
  const home = () => {
    const body = document.querySelector(".panel-body");
    if (body) body.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button ref={ref} className="heroname" onClick={home} aria-label="Surya J — back to the top">
      SURYA <span>J</span>
    </button>
  );
}

/* The opening titles. Not a splash card over the canvas — a HUD in the
   corner, so the push-in plays in full behind it from the first frame. */
function IntroHud() {
  return (
    <div className="introhud">
      <span className="introhud-m"><i /><i /><i /></span>
      <h1 className="introhud-name">SURYA J</h1>
      <p className="introhud-role mono">Software developer</p>
      <p className="introhud-bio">
        Software developer by profession, <em className="carlove">hardcore car enthusiast</em> by obsession. I build
        high-performance web and mobile systems with the same precision, speed and
        architecture tuning that goes into an M-Power V8.
      </p>
    </div>
  );
}

const GARAGE_CSS = `
  /* the garage is a dark room whatever the page theme is, so everything
     that sits straight on it is light */
  /* the shed is the hero: one screen of it, then the sections scroll over */
  .hero-shed{position:relative;height:100svh;pointer-events:none}

  .plate{position:absolute;left:0;right:0;bottom:clamp(1.6rem,5vh,3.4rem);z-index:40;display:flex;flex-direction:column;align-items:center;gap:.5rem;
    pointer-events:none;opacity:0;transform:translate3d(0,14px,0);transition:opacity .7s ease,transform .9s ${EASE.out}}
  .plate.in{opacity:1;transform:none}
  .plate-name{font-family:${FONT.name};font-weight:340;font-size:clamp(2.6rem,7vw,4.6rem);line-height:.9;letter-spacing:.05em;color:#eef4ff;text-shadow:0 2px 30px rgba(0,0,0,.65)}
  .plate-role{font-size:.64rem;letter-spacing:.14em;color:#9fb6d4}
  .plate-parts{display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem;margin-top:1rem;pointer-events:auto}
  .plate-part{display:flex;flex-direction:column;align-items:flex-start;gap:.1rem;padding:.5rem .85rem;border-radius:10px;
    border:1px solid rgba(146,180,224,.26);background:rgba(10,16,28,.55);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
    color:#dce8fa;transition:border-color .3s ease,background-color .3s ease,transform .35s ${EASE.out}}
  .plate-part:hover{border-color:#38bdf8;background:rgba(14,26,44,.78);transform:translateY(-2px)}
  .plate-part .mono{font-family:${FONT.mono};font-size:.58rem;letter-spacing:.16em;text-transform:uppercase;color:#38bdf8}
  .plate-opens{font-size:.82rem;font-weight:500}
  .plate-hint{margin-top:.7rem;font-size:.58rem;letter-spacing:.18em;text-transform:uppercase;color:#6f88a8}

  /* a panel down one side, not a full screen: the point of zooming the
     camera to a part is that you can still see the part */
  /* the scroll rail: height and nothing else, so the tour has a scrubber */
  .rail{height:620svh;pointer-events:none}

  /* The panel sits down the left so the car keeps the right of the frame,
     where most of the pins are. On a phone it takes the screen, because a
     42% column of text on a 390px screen is unreadable. */
  /* A dock floating in the room, not a wall glued to the window: a strip
     of the shed shows round every edge, which is what makes it read as part
     of the scene rather than a second browser tab. */
  /* No card. The dossier is a wash that thickens towards the left edge of
     the window and dissolves into the shed on its right, so the type and
     the car read as one surface rather than a box pasted over a render.
     The mask is what removes the edge; a border would put it straight back. */
  /* The feather lives on its own layer. Masking an element that also
     carries a backdrop-filter makes Chromium composite it twice and apply
     the mask to one copy — which painted the whole dossier a second time,
     offset and clipped. Background and blur are masked here; the type sits
     above it, untouched and crisp. */
  .panel{position:fixed;top:0;left:0;bottom:0;width:min(760px,56vw);z-index:1050;
    border:0;border-radius:0;box-shadow:none;background:transparent;
    display:flex;flex-direction:column;isolation:isolate;
    pointer-events:auto}
  /* nothing to touch until the car has parked */
  .panel:not(.open){visibility:hidden;pointer-events:none}
  /* A screen's height of empty runway above the dossier: at the top of the
     scroll the content sits just below the bottom edge, and it comes up
     exactly as far as you scroll, no further and no faster. */
  .panel .runway{height:var(--runway,100vh);flex:none}
  /* A gradient and nothing else. mask-image and backdrop-filter on a
     fixed layer above a scrolling container both make Chromium keep stale
     tiles, which is what painted the dossier a second time, offset and
     clipped. The gradient alone gives the same soft edge with none of that. */
  .panel::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;
    background:linear-gradient(90deg,
      color-mix(in srgb,${T.bg} 97%, transparent) 0%,
      color-mix(in srgb,${T.bg} 95%, transparent) 46%,
      color-mix(in srgb,${T.bg} 80%, transparent) 68%,
      color-mix(in srgb,${T.bg} 42%, transparent) 86%,
      transparent 100%);
    opacity:var(--k,0)}
  /* --k runs 0 to 1 over the runway, smoothed, and drives everything that
     hands over from the hero to the dossier: the backing above fades in,
     the titles fade and rise, the name flies to its corner */
  /* the words stay well inside the feather, so nothing readable fades out */
  .panel .dossier{max-width:31rem}

  /* the scroll position, as a hairline on the glass */
  .panel-rail{z-index:2;position:absolute;left:0;top:4.6rem;bottom:1.2rem;width:2px;border-radius:2px;
    background:rgba(146,180,224,.12);overflow:hidden;pointer-events:none;z-index:3}
  .panel-rail i{display:block;width:100%;height:100%;transform-origin:50% 0;transform:scaleY(.06);
    background:linear-gradient(180deg,#38bdf8,#2563eb);box-shadow:0 0 8px rgba(56,189,248,.8)}
  /* the dossier's own masthead: who this is, and why there is a car here */
  .dossier{padding:clamp(1.6rem,4vw,2.4rem) clamp(1.1rem,3vw,1.6rem) 0}
  .dossier-m{display:flex;gap:3px;margin-bottom:.9rem}
  .dossier-m i{display:block;width:16px;height:3px}
  .dossier-m i:nth-child(1){background:#0066B1}
  .dossier-m i:nth-child(2){background:#003399}
  .dossier-m i:nth-child(3){background:#E30613}
  .dossier-name{font-family:${FONT.name};font-weight:340;font-size:clamp(2.4rem,6vw,3.4rem);line-height:.9;
    letter-spacing:.05em;color:${T.ink}}
  .dossier-role{margin-top:.5rem;font-size:.6rem;letter-spacing:.16em;text-transform:uppercase;color:#38bdf8}
  .dossier-line{margin-top:1.1rem;font-size:.86rem;line-height:1.65;color:${T.body};max-width:42ch}
  .dossier-hint{margin-top:1.2rem;padding-top:1.1rem;border-top:1px solid ${T.line};
    font-size:.56rem;letter-spacing:.18em;text-transform:uppercase;color:${T.muted}}

  /* the name: same box as the corner mark, so in the corner it is exactly
     the mark; in the titles it is the same element scaled up */
  .heroname{position:fixed;left:0;top:0;z-index:1201;margin:0;background:none;border:0;cursor:pointer;
    padding:.45rem .2rem .45rem 0;font-family:${FONT.name};font-weight:360;font-size:1.5rem;
    text-transform:uppercase;letter-spacing:.06em;line-height:1;color:#eef4ff;white-space:nowrap;
    text-shadow:0 2px 30px rgba(0,0,0,.7);transform-origin:0 0;pointer-events:none;opacity:0;
    transform:translate3d(calc(var(--ax,0px) + (var(--bx,0px) - var(--ax,0px)) * var(--k,0)),
      calc(var(--ay,0px) + (var(--by,0px) - var(--ay,0px)) * var(--k,0)),0)
      scale(calc(var(--as,1) + (1 - var(--as,1)) * var(--k,0)));
    transition:opacity .7s ease .25s}
  .heroname span{color:${T.blue}}
  .heroname.ready{opacity:1}
  :root.lifted .heroname{pointer-events:auto}
  .heroname:focus-visible{outline:2px solid ${T.blue};outline-offset:3px}
  /* placeholders: they keep their place in the layout so the name can be
     measured against them, and are never seen */
  .mark,.introhud-name{visibility:hidden}
  .introhud-name{animation:none}

  /* the titles sit low and left, out of the car's way */
  /* left of frame: the lens is shifted so the car holds the right, which
     leaves this side clear for the titles instead of writing over the nose */
  /* bottom left, and narrow enough that the bio wraps well short of the
     car — the lens holds the car on the right, so the left half is ours */
  .introhud{position:fixed;left:clamp(1.6rem,5vw,4.5rem);bottom:clamp(2.6rem,9vh,5.5rem);z-index:1200;
    width:min(26rem,calc(46vw - 4rem));
    display:flex;flex-direction:column;align-items:flex-start;text-align:left;pointer-events:none;
    opacity:calc(1 - var(--k,0) * 4.5);transform:translate3d(0,calc(var(--k,0) * -90px),0)}
  .introhud-m{display:flex;gap:3px;margin-bottom:1rem;animation:introRise .9s ${EASE.out} .1s both}
  .introhud-m i{display:block;width:18px;height:3px}
  .introhud-m i:nth-child(1){background:#0066B1}
  .introhud-m i:nth-child(2){background:#003399}
  .introhud-m i:nth-child(3){background:#E30613}
  .introhud-name{font-family:${FONT.name};font-weight:340;font-size:clamp(3rem,8vw,5.6rem);line-height:1;
    letter-spacing:.06em;color:#eef4ff;text-shadow:0 2px 40px rgba(0,0,0,.8);
    animation:introRise 1.1s ${EASE.out} .25s both}
  .introhud-role{margin-top:1rem;font-size:.66rem;letter-spacing:.22em;text-transform:uppercase;color:#38bdf8;
    animation:introRise 1.1s ${EASE.out} .45s both}
  /* the one thing in the bio that is not about software: picked out in
     white with the M tricolour running under it */
  .carlove{font-style:normal;font-weight:600;color:#f4f8ff;white-space:nowrap;padding-bottom:2px;
    background:linear-gradient(90deg,#0066B1 0 33.3%,#003399 33.3% 66.6%,#E30613 66.6% 100%) left bottom/100% 2px no-repeat}
  .introhud-bio{margin-top:1.3rem;font-size:clamp(.8rem,1.4vw,.92rem);line-height:1.7;color:#b4c8dd;
    text-shadow:0 1px 20px rgba(0,0,0,.9);animation:introRise 1.2s ${EASE.out} .65s both}
  @keyframes introRise{from{opacity:0;transform:translate3d(0,22px,0)}to{opacity:1;transform:none}}
  @media (max-width:900px){.introhud{width:auto;right:clamp(1.6rem,5vw,4.5rem);bottom:clamp(2rem,6vh,3rem)}}

  .panel-top{flex:none;display:flex;align-items:center;justify-content:space-between;gap:1rem;
    padding:.9rem clamp(1.1rem,3vw,1.6rem);border-bottom:1px solid ${T.line}}
  .panel-tag{font-family:${FONT.mono};font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:#38bdf8}
  .panel-x{display:flex;align-items:center;gap:.45rem;color:${T.navy}}
  .panel-x .mono{font-family:${FONT.mono};font-size:.6rem;letter-spacing:.16em;text-transform:uppercase}
  .panel-x::after{content:"";width:13px;height:1.5px;background:currentColor}
  .panel-x:hover{color:${T.blue}}
  .panel .panel-body p,.panel .panel-body li{font-size:.97rem !important;line-height:1.7 !important}
  .panel .panel-body .mono{font-size:.75rem !important;letter-spacing:.1em}
  .panel .panel-body .cap{font-size:.71rem !important}
  .panel .panel-body .tag,.panel .panel-body .chip{font-size:.76rem !important}
  .panel .dossier-line{font-size:.97rem;line-height:1.7}
  .panel .dossier-role,.panel .dossier-hint{font-size:.7rem}

  /* the scroll area starts below the corner name, so text never runs
     underneath it on its way up */
  @media (min-width:901px){.panel-body{margin-top:4.6rem}}
  .sr-only{position:absolute !important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;
    clip-path:inset(50%);white-space:nowrap;border:0}

  /* text dissolves as it reaches the top of the dossier instead of being
     sliced off by the edge of the scroll area, and eases out at the foot */
  .panel-body{-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 3.2rem,#000 calc(100% - 2.4rem),transparent 100%);
    mask-image:linear-gradient(180deg,transparent 0,#000 3.2rem,#000 calc(100% - 2.4rem),transparent 100%)}
  .panel-body{position:relative;z-index:1;flex:1 1 0;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;
    -webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none}
  .panel-body::-webkit-scrollbar{display:none;width:0;height:0}

  /* ── project drilldown: the list slides out left, the project slides in,
     inside the same dock ── */
  .panel-body{transition:opacity .4s cubic-bezier(.16,1,.3,1),transform .4s cubic-bezier(.16,1,.3,1)}
  .panel.drill .panel-body{opacity:0;transform:translate3d(-20px,0,0);pointer-events:none;visibility:hidden;
    transition:opacity .4s cubic-bezier(.16,1,.3,1),transform .4s cubic-bezier(.16,1,.3,1),visibility 0s linear .4s}
  .pdetail{position:absolute;left:0;right:0;bottom:0;top:0;z-index:2;overflow-y:auto;overflow-x:hidden;
    overscroll-behavior:contain;scrollbar-width:none;opacity:0;transform:translate3d(20px,0,0);
    visibility:hidden;pointer-events:none;
    transition:opacity .4s cubic-bezier(.16,1,.3,1),transform .4s cubic-bezier(.16,1,.3,1),visibility 0s linear .4s}
  .pdetail::-webkit-scrollbar{display:none}
  .panel.drill .pdetail{opacity:1;transform:none;visibility:visible;pointer-events:auto;
    transition:opacity .4s cubic-bezier(.16,1,.3,1),transform .4s cubic-bezier(.16,1,.3,1),visibility 0s}
  @media (min-width:901px){.pdetail{top:4.6rem}}
  .pd-col{max-width:31rem;padding:0 clamp(1.1rem,3vw,1.6rem) 3rem}
  .pd-bar{position:sticky;top:0;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:.8rem;
    flex-wrap:wrap;padding:1rem 0 .9rem;border-bottom:1px solid rgba(255,255,255,.08);isolation:isolate}
  /* the bar's backing feathers out to the right and below, like the dock
     itself, instead of ending in a box edge over the car */
  .pd-bar::before{content:"";position:absolute;z-index:-1;inset:-1rem -40% -1.6rem calc(-1 * clamp(1.1rem,3vw,1.6rem));pointer-events:none;
    background:linear-gradient(90deg,${T.bg} 0%,${T.bg} 58%,transparent 100%);
    -webkit-mask-image:linear-gradient(180deg,#000 82%,transparent);mask-image:linear-gradient(180deg,#000 82%,transparent)}
  .pd-back{display:inline-flex;align-items:center;gap:.5rem;font-size:.66rem;letter-spacing:.14em;text-transform:uppercase;
    color:#dbeefe;padding:.5rem .85rem;border-radius:999px;border:1px solid rgba(56,189,248,.35);background:rgba(56,189,248,.05);
    transition:border-color .25s ease,background-color .25s ease}
  .pd-back i{font-style:normal;display:inline-block;transition:transform .35s cubic-bezier(.16,1,.3,1)}
  .pd-back:hover{border-color:rgba(56,189,248,.7);background:rgba(56,189,248,.1)}
  .pd-back:hover i{transform:translate3d(-4px,0,0)}
  .pd-back:focus-visible{outline:2px solid #38bdf8;outline-offset:3px}
  .pd-meta{display:flex;align-items:center;gap:.6rem;font-size:.62rem;letter-spacing:.12em;text-transform:uppercase}
  .pd-index{color:#0b1220;background:#38bdf8;padding:.18rem .45rem;border-radius:4px;font-weight:600}
  .pd-client{color:#7f97b5}
  .pd-head{display:grid;grid-template-columns:minmax(0,1fr) 112px;gap:1.1rem;align-items:start;margin-top:1.4rem}
  .pd-title{font-family:${FONT.sans};font-weight:650;font-size:22px;line-height:1.25;letter-spacing:-.01em;color:#fff;margin:0}
  .pd-tag{margin:.35rem 0 .9rem;font-size:.86rem !important;color:#8ea6c2}
  .pd-stack{display:flex;flex-wrap:wrap;gap:.35rem}
  .pd-stack span{font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:#38bdf8;
    padding:.24rem .5rem;border-radius:5px;border:1px solid rgba(56,189,248,.3);background:rgba(56,189,248,.05)}
  .pd-schem{height:100px;border:1px solid rgba(255,255,255,.1);border-radius:10px;display:flex;align-items:center;justify-content:center;
    overflow:hidden;background:linear-gradient(160deg,rgba(56,189,248,.06),rgba(2,6,23,.2))}
  .pd-schem svg{height:84px !important;width:auto !important;max-width:100%}
  .pd-row{border-top:1px solid rgba(255,255,255,.08);padding:1.05rem 0;margin-top:1.1rem}
  .pd-row + .pd-row{margin-top:0}
  .pd-label{font-size:.66rem !important;letter-spacing:.14em;text-transform:uppercase;color:#38bdf8;margin-bottom:.5rem}
  .pd-row p{margin:0;color:#c3d3e6}
  .pd-row strong{color:#f1f6ff;font-weight:600}
  .pd-variant + .pd-variant{margin-top:.8rem !important}
  .pd-variant .mono{font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:#7f97b5}
  .pd-foot{border-top:1px solid rgba(255,255,255,.08);padding-top:1.3rem;margin-top:.2rem}
  .pd-cta{position:relative;display:inline-flex;align-items:center;gap:.6rem;font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;
    color:#e6f6ff;padding:.85rem 1.2rem .85rem 1.6rem;border-radius:8px;border:1px solid #38bdf8;background:rgba(56,189,248,.07);
    box-shadow:0 0 0 1px rgba(56,189,248,.12),0 0 26px -8px rgba(56,189,248,.6);transition:box-shadow .3s ease,background-color .3s ease}
  /* the M tricolour, down the leading edge */
  .pd-cta::before{content:"";position:absolute;left:.6rem;top:.7rem;bottom:.7rem;width:4px;border-radius:2px;
    background:linear-gradient(180deg,#0066B1 0 33.3%,#003399 33.3% 66.6%,#E30613 66.6% 100%)}
  .pd-cta:hover{background:rgba(56,189,248,.14);box-shadow:0 0 0 1px rgba(56,189,248,.3),0 0 34px -6px rgba(56,189,248,.8)}
  .pd-private{display:inline-block;font-size:.64rem;letter-spacing:.14em;text-transform:uppercase;color:#7f97b5;
    padding:.6rem .9rem;border-radius:8px;border:1px solid rgba(255,255,255,.1)}
  .panel .sec{padding:1.4rem 0}
  .panel .sec > .wrap{background:transparent;border:0;border-radius:0;backdrop-filter:none;-webkit-backdrop-filter:none;
    box-shadow:none;padding-block:0;padding-inline:clamp(1.1rem,3vw,1.6rem);
    max-width:31rem;margin-inline:0}
  /* The cards were drawn for a full-width page: at 560px each mockup ran
     nearly 400px tall, so twenty-one of them made thirteen screens of
     scrolling with no way to scan. In the column the art is a thumbnail and
     the words lead. */
  /* In the dossier the thumbnails are smoked glass. The mockups draw their
     fills in the theme blue, which at this size reads as solid placeholder
     blocks; redefining the blues here turns them into muted steel accents
     without touching the full-size art anywhere else. */
  .panel .pcard-art{height:132px;aspect-ratio:auto;padding:3.5%;border-radius:14px;
    --blue:#2f6f9a;--blueDeep:#1f4c6e;--sky:#5aa4cf;--blue-rgb:56 189 248;
    background:linear-gradient(160deg,rgba(15,23,42,.72),rgba(2,6,23,.56));
    border:1px solid rgba(255,255,255,.08);
    box-shadow:0 8px 30px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.05);
    transition:border-color .3s ease,transform .45s cubic-bezier(.16,1,.3,1),box-shadow .45s ease}
  .panel .pcard:hover .pcard-art{border-color:rgba(56,189,248,.42);transform:translate3d(0,-2px,0);
    box-shadow:0 14px 36px rgba(0,0,0,.55),0 0 26px rgba(56,189,248,.12)}
  .panel .pcard-mock{filter:saturate(.8)}

  .panel #projects .wrap > div[style*="grid"]{gap:.65rem !important}
  .panel .pcard{display:flex;flex-direction:column;gap:.38rem;padding:.95rem 1.05rem;border-radius:12px;
    border:1px solid rgba(255,255,255,.08);background:transparent;
    transition:border-color .3s ease,transform .45s cubic-bezier(.16,1,.3,1),background-color .3s ease}
  .panel .pcard:hover{border-color:rgba(56,189,248,.42);transform:translate3d(0,-2px,0);
    background:rgba(56,189,248,.04)}
  .panel .pcard .pcard-art{display:none}
  .panel .pcard-name{order:1;margin-top:0 !important;font-size:1.08rem !important;color:#f1f6ff !important}
  .panel .pcard-for{order:2;margin-top:0 !important;font-size:.66rem !important;letter-spacing:.12em;
    text-transform:uppercase;color:#7f97b5 !important}
  .panel .pcard > .mono:not(.pcard-for){order:3;margin-top:.15rem !important;font-size:.66rem !important;
    letter-spacing:.12em;text-transform:uppercase;color:#38bdf8 !important}
  .panel .pcard:hover .pcard-name{color:#bae6fd !important}
  /* solid blue pills and active filters become M-telemetry tags */
  .panel .pill{background:rgba(56,189,248,.1);color:#7dd3fc;border:1px solid rgba(56,189,248,.35)}
  .panel .chip{background:rgba(15,23,42,.6);border-color:rgba(255,255,255,.08)}
  .panel .chip.on{background:rgba(56,189,248,.14);border-color:rgba(56,189,248,.55);color:#bae6fd}
  .panel .tag{background:rgba(15,23,42,.6);border-color:rgba(255,255,255,.08);color:#b9cce4}
  .panel #projects .wrap > div[style*="grid"]{gap:1.25rem !important}
  .panel .sec h2{font-size:clamp(1.8rem,5vw,2.6rem) !important}
  @media (max-width:900px){
    .panel{left:0;right:0;width:100%;top:auto;height:64svh}
    .panel::before{background:linear-gradient(180deg,
        transparent 0%,
        color-mix(in srgb,${T.bg} 70%, transparent) 8%,
        color-mix(in srgb,${T.bg} 95%, transparent) 24%,
        color-mix(in srgb,${T.bg} 98%, transparent) 100%)}
    .panel .sec > .wrap,.panel .dossier{max-width:none}
    .panel-rail{display:none}
  }

  @media (max-width:640px){.plate-parts{gap:.35rem}.plate-part{padding:.42rem .6rem}}
`;

export default function Portfolio() {
  const mobile = useIsMobile();
  const reduced = useReducedMotion();
  const motion = !reduced;
  const [menu, setMenu] = useState(false);
  const [theme, toggleTheme] = useTheme();
  // the car's entrance has two moments: the page is uncovered part way
  // through the wipe, and the scroll is handed over only once it parks
  const [carShown, setCarShown] = useState(reduced);
  const [carParked, setCarParked] = useState(reduced);
  const dockAt = useRef(0);

  // clicking a part of the car scrolls the dossier to what it stands for
  const jump = useCallback((id) => {
    window.dispatchEvent(new Event("drill:close"));
    const el = id && document.getElementById(id);
    const body = el && el.closest(".panel-body");
    if (el && body) body.scrollTo({ top: el.offsetTop - 12, behavior: "smooth" });
  }, []);

  // a reload restores the old scroll position, which would start the tour
  // half way round the car. Nothing scrolls until the lights are up.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!carParked) window.scrollTo(0, 0);
    const root = document.documentElement;
    // While a card is open it owns the wheel. If the page scrolled instead,
    // that scroll released the pin and shut the card the moment you tried to
    // read it.
    // the window never scrolls: the dossier does
    root.style.overflow = "hidden";
    return () => { root.style.overflow = ""; };
  }, [carParked]);

  const onCarShown = useCallback(() => setCarShown(true), []);
  const onCarParked = useCallback(() => setCarParked(true), []);

  const go = useCallback((id) => {
    setMenu(false);
    jump(id);
  }, [jump]);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e) => { if (e.key === "Escape") setMenu(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menu]);

  return (
    <>
      <style>{THEME_CSS + CSS + MOTION_CSS + FX_CSS + CAR_CSS + GARAGE_CSS}</style>
      <IntroHud />
      <HeroName />
      <ScrollBar />

      {/* the garage is the whole site: the car is the navigation, and each
          part of it opens a drawer of the portfolio over the top */}
      <CarScene reduced={reduced} onReveal={onCarShown} onDone={onCarParked} onPart={jump} progressRef={dockAt} />

      {/* the dossier is always there: the left is what you read, the right
          is the car, and scrolling one drives the other */}
      <Panel shown={carParked} mobile={mobile} motion={motion} progressRef={dockAt} />


      {/* cursor smoke: above the page, below the chrome, menu and modals */}
      <Smoke />
      <Menu open={menu} go={go} mobile={mobile} />
      <TopBar open={menu} setOpen={setMenu} go={go} theme={theme} toggleTheme={toggleTheme} />

      <Analytics />
      <SpeedInsights />
    </>
  );
}
