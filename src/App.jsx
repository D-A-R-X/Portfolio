import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  ["Android Applications", "Kotlin · Jetpack Compose", "Native Kotlin clients on MVVM and Coroutines, with encrypted local storage. Mconnect and the Aivida field apps."],
  ["Web Platforms", "Next.js · React · TypeScript", "Next.js and TypeScript platforms with live backends and generated reports. Manju PMS and Travel Desk."],
  ["Backend Services", "Go · Python · FastAPI", "Go and Python services that scale apart from the apps they serve. Airix Geo Tracking and Mentorix."],
  ["Realtime Systems", "Convex · Firebase", "Live state shared across web and mobile. Manju PMS runs on a real-time Convex backend."],
  ["Geospatial & Live Tracking", "PostGIS · TimescaleDB · Redis", "Location ingestion, trip sessions and tamper checks on PostGIS and TimescaleDB, with Redis for live state."],
  ["AI & ML Systems", "Generative AI · Prompting · ML", "RandomForest career prediction in Mentorix and an AI sales assistant inside Manju PMS."],
  ["Design Systems", "Tokens · Theming · Components", "Semantic colour tokens, so every screen themes light and dark from one source."],
  ["APIs & Integrations", "REST · Webhooks · WhatsApp", "REST APIs, webhooks and WhatsApp flows, like the token-scoped driver links in Travel Desk."],
  ["Cross-platform Apps", "Flutter · Firebase", "Flutter with Firebase where one codebase has to cover both Android and iOS."],
  ["Deployment", "Vercel · Render · Docker", "Vercel, Render and Docker, with separate stacks per brand so one cannot take the other down."],
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

  .chrome{position:fixed;right:clamp(1rem,3vw,2.2rem);top:clamp(.75rem,1.9vh,1.2rem);z-index:1260;display:flex;align-items:center;gap:.5rem}
  .chip-btn{display:inline-flex;align-items:center;gap:.45rem;height:36px;padding:0 .95rem;border-radius:999px;border:1px solid ${T.line2};background:${T.surface};color:${T.ink};font-size:.82rem;font-weight:500;box-shadow:${SHADOW.card};transition:border-color .3s ease,color .3s ease,transform .3s ${EASE.out}}
  .chip-btn:hover{border-color:${T.blue};color:${T.blue};transform:translate3d(0,-1px,0)}
  .theme-btn{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;border:1px solid ${T.line2};background:${T.surface};color:${T.ink};box-shadow:${SHADOW.card};transition:border-color .3s ease,color .3s ease}
  .theme-btn:hover{border-color:${T.blue};color:${T.blue}}
  .burger{display:grid;place-content:center;gap:5px;width:36px;height:36px;border-radius:50%;border:1px solid ${T.line2};background:${T.surface};box-shadow:${SHADOW.card};transition:border-color .3s ease}
  .burger:hover{border-color:${T.blue}}
  .burger i{display:block;width:15px;height:1.5px;background:${T.ink};border-radius:2px;transition:transform .45s ${EASE.out},background-color .3s ease}
  .burger.x i:first-child{transform:translate3d(0,3.2px,0) rotate(45deg)}
  .burger.x i:last-child{transform:translate3d(0,-3.2px,0) rotate(-45deg)}




  .menu{position:fixed;inset:0;z-index:1250;background:${T.bg};display:flex;flex-direction:column;transform:translate3d(0,102%,0);transition:transform .8s ${EASE.inOut};overflow:auto}
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
                From the Android app in someone's pocket to the service tracking a fleet in real time. Designed, built and shipped.
              </p>
            </Reveal>
          </div>

          <div ref={ref}>
            {SERVICES.map(([name, stack, spec], i) => (
              <div key={name} ref={(el) => { rows.current[i] = el; }} className="svc" tabIndex={0} data-d={motion ? String(Math.min(3, i)) : "0"}>
                <span className="svc-i mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="svc-s">{stack}</span>
                <span className="svc-n">{name}</span>
                <span className="svc-x">{spec}</span>
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
        <div className="sec-head">
        <Reveal dir="up" enabled={motion} style={{ marginBottom: "1.4rem" }}><span className="pill">Experience</span></Reveal>
        <Lines lines={["Where *I've*", "→worked"]} motion={motion} style={{ fontSize: mobile ? "3rem" : "clamp(3.6rem,6.4vw,6.4rem)", marginBottom: mobile ? "2.4rem" : "3.6rem" }} />

</div>
        <div className="sec-body">
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
                        {job.site && (
                          <a className="pd-link" href={job.site} target="_blank" rel="noopener noreferrer" style={{ marginTop: "1.2rem" }}>
                            Visit {new URL(job.site).hostname.replace(/^www\./, "")} <span aria-hidden="true">&#8599;</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
}

/* ─── PROJECT DETAIL ─────────────────────────────────────────
   A project opens in place, in its own row: the row folds open on the
   problem, the decision and the outcome, with the schematic and the specs
   beside them. Nothing covers the list or the car. */
const LINK_LABEL = { GitHub: "View source repo", "Play Store": "Open on Play Store" };

function ProjectDetail({ p }) {
  const orgs = p.org ? [p.org, ...new Set((p.variants || []).map((v) => v.org).filter((o) => o !== p.org))] : [];
  const rows = [
    ["01", "The problem", p.context || p.problem],
    ["02", "Engineering decision", p.highlight],
    ["03", "Architecture & outcome", p.power],
  ];
  if (p.org && ORGS[p.org]) rows.push(["04", "Client", ORGS[p.org].blurb]);
  if (p.variants) rows.push([String(rows.length + 1).padStart(2, "0"), "Also deployed as", p.variants]);

  return (
    <div className="pd-x">
      <div className="pd-head">
        <p className="pd-sub">{p.tag}</p>
        <div className="pd-preview" aria-hidden="true"><Mockup kind={p.mock} width="100%" draw /></div>
        <dl className="pd-meta">
          {[
            ["Client", orgs.length ? orgs.join(" & ") : "Personal project"],
            ["Type", p.cat],
            ["Stack", p.stack.join(", ")],
            ["Source", p.repo ? p.repoLabel : "Private"],
          ].map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        {p.repo && (
          <a className="pd-link" href={p.repo} target="_blank" rel="noopener noreferrer">
            {LINK_LABEL[p.repoLabel] || p.repoLabel} <span aria-hidden="true">&#8599;</span>
          </a>
        )}
      </div>
      <div className="pd-body">
        {rows.map(([n, k, v]) => (
          <div key={n} className="pd-row">
            <div className="pd-label">{n} &middot; {k}</div>
            {Array.isArray(v)
              ? <div>{v.map((x) => <p key={x.name} className="pd-variant"><strong>{x.name}.</strong> {x.note}</p>)}</div>
              : <p>{v}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── PROJECTS ────────────────────────────────────────────── */
function Projects({ mobile, motion }) {
  const [filter, setFilter] = useState("All");
  // the open row, and the last one opened (kept rendered while it folds shut)
  const [open, setOpen] = useState(null);
  const [last, setLast] = useState(null);
  const toggle = (id) => { setOpen((o) => (o === id ? null : id)); setLast(id); };
  // each project has its own angle on the car while it is open
  useEffect(() => {
    const p = PROJECTS.find((x) => x.id === open);
    window.dispatchEvent(new CustomEvent("drill:shot", { detail: p ? PROJECTS.indexOf(p) : null }));
  }, [open]);
  useEffect(() => () => window.dispatchEvent(new CustomEvent("drill:shot", { detail: null })), []);
  // Scrolled away from, an open project closes, so its close-up hands the
  // camera back to the scroll instead of holding one angle over everything.
  useEffect(() => {
    if (open === null) return undefined;
    const row = document.getElementById(`pd-${open}`)?.parentElement;
    if (!row || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) setOpen(null); });
    io.observe(row);
    return () => io.disconnect();
  }, [open]);
  // and the same if the filter hides it
  useEffect(() => { setOpen(null); }, [filter]);
  const list = useMemo(() => (filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.cat === filter)), [filter]);
  const cols = mobile ? 1 : 2;

  return (
    <section id="projects" className="sec">
      <div className="wrap">
        <div className="sec-head">
        {/* "SOME   of my / PROJECTS" — the split-line heading */}
        <div className="disp" style={{ fontSize: mobile ? "3.2rem" : "clamp(4rem,8vw,8.4rem)", marginBottom: mobile ? "1.6rem" : "2rem" }}>
          <Lines lines={["Some"]} motion={motion} as="div" />
          {/* "of my own" follows on: spread to the far edge it read as two headings */}
          <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "baseline", gap: ".35em", flexWrap: "wrap" }}>
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
        </div>

        <div className="sec-body">
        <FXGrid style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gap: mobile ? "2.4rem" : "3rem 2rem" }}>
          {list.map((p, i) => (
            <Reveal key={p.id} dir="up" delay={(i % cols) * 0.08} enabled={motion}>
              <button className="pcard" onClick={() => toggle(p.id)} aria-expanded={open === p.id} aria-controls={`pd-${p.id}`}>
                <span className="pcard-head mono" aria-hidden="true">
                  {String(PROJECTS.indexOf(p) + 1).padStart(2, "0")}
                </span>
                <div className="pcard-ledger">{p.stack.slice(0, 3).join(", ")}</div>
                <div className="pcard-name" style={{ fontFamily: FONT.sans, fontWeight: 600, letterSpacing: "-.015em", fontSize: mobile ? "1.3rem" : "1.4rem", lineHeight: 1.25, color: T.ink, marginTop: ".55rem" }}>{p.name}</div>
                <span className="pcard-tag">{p.tag}</span>
                <div className="mono pcard-for" style={{ fontSize: ".66rem", color: p.org ? T.blue : T.faint, marginTop: ".35rem" }}>
                  {p.org ? `For ${p.org}` : "Personal project"}
                  {/* two children for the same brand should not say it twice */}
                  {p.variants && [...new Set(p.variants.map((v) => v.org))].map((o) => (
                    <span key={o} style={{ color: T.muted }}> + {o}</span>
                  ))}
                </div>
                <span className="pcard-open mono" aria-hidden="true">+</span>
              </button>
              <div id={`pd-${p.id}`} className={`drawer pexp${open === p.id ? " open" : ""}`} role="region" aria-label={`${p.name} details`}>
                <div>{(open === p.id || last === p.id) && <ProjectDetail p={p} />}</div>
              </div>
            </Reveal>
          ))}
        </FXGrid>
        </div>
      </div>
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
        <div className="sec-head">
        <Lines lines={["Education *&*", "→the stack"]} motion={motion} style={{ fontSize: mobile ? "2.8rem" : "clamp(3.4rem,6.6vw,6.6rem)", marginBottom: "1.4rem" }} />
        <Decode text="Where I studied, what I build with, and the rules I hold myself to." enabled={motion} className="mono" style={{ fontSize: ".78rem", lineHeight: 1.6, color: T.navy, maxWidth: "52ch", marginBottom: "3rem" }} />

</div>
        <div className="sec-body">
        {/* education */}
        {EDUCATION.map((e) => (
          <Reveal key={e.degree} dir="up" enabled={motion} style={{ borderTop: `1px solid ${T.ink}`, paddingTop: "1.4rem", marginBottom: "3.4rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.4fr 1fr", gap: mobile ? "1rem" : "2rem", alignItems: "start" }}>
              <div>
                <h3 style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: mobile ? "1.5rem" : "1.9rem", lineHeight: 1.2, color: T.ink, letterSpacing: "-.015em" }}>{e.degree}</h3>
                <p style={{ ...TYPE.body, marginTop: ".5rem" }}>
                  {e.site
                    ? <a className="pd-link" href={e.site} target="_blank" rel="noopener noreferrer" style={{ fontSize: "inherit" }}>{e.school} <span aria-hidden="true">&#8599;</span></a>
                    : e.school} · {e.place}
                </p>
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
        <div className="sec-head">
        <Lines lines={["Credentials *&*", "recognition"]} motion={motion} style={{ fontSize: mobile ? "2.8rem" : "clamp(3.4rem,6.6vw,6.6rem)", marginBottom: "1.4rem" }} />
        <Decode text="Certified, published and presented: industry certifications, a conference paper and national hackathons." enabled={motion} className="mono" style={{ fontSize: ".78rem", lineHeight: 1.6, color: T.navy, maxWidth: "52ch", marginBottom: "1.6rem" }} />
        <Reveal dir="up" enabled={motion} style={{ marginBottom: "3rem" }}><span className="pill">Total: {CERTS.length + ACHIEVEMENTS.length}</span></Reveal>

</div>
        <div className="sec-body">
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
                  {c.name} <span style={{ color: T.muted, fontSize: ".72em" }}>· {c.issuer}</span>
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
        <div className="sec-head">
        <Reveal dir="up" enabled={motion} style={{ marginBottom: "1.4rem" }}><span className="pill">Contact</span></Reveal>
        <Lines lines={["*Let's*", "build", "→something"]} motion={motion} style={{ fontSize: mobile ? "3.6rem" : "clamp(4.4rem,10vw,10rem)", marginBottom: "2.4rem" }} />

</div>
        <div className="sec-body">
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
      el.scrollTop += ev.deltaY;
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
      el.scrollTop += lastY - y;
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

  // Blocks rise into place as they scroll into the dock instead of sitting
  // there as a flat wall: 18px and a fade, staggered when several arrive
  // together. Once in, they stay in. Uses `translate`, so it never fights
  // the transforms the sections already animate.
  useEffect(() => {
    const el = body.current;
    if (!el || !motion || typeof IntersectionObserver === "undefined") return undefined;
    const targets = el.querySelectorAll(".sec .wrap > *, .pcard, .svc, .row, .row-btn");
    const io = new IntersectionObserver((entries) => {
      let n = 0;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.style.setProperty("--rd", `${Math.min(n, 6) * 60}ms`);
        e.target.classList.add("dz-seen");
        io.unobserve(e.target);
        n += 1;
      }
    }, { root: el, rootMargin: "0px 0px -6% 0px", threshold: 0.08 });
    targets.forEach((t) => { t.classList.add("dz-rv"); io.observe(t); });
    // a backstop: if the observer is late (a throttled or background tab),
    // anything already on screen is shown anyway; content must never be
    // left invisible waiting for an animation
    const sweep = () => {
      const top = el.getBoundingClientRect().top, bottom = top + el.clientHeight;
      el.querySelectorAll(".dz-rv:not(.dz-seen)").forEach((t) => {
        const r = t.getBoundingClientRect();
        if (r.bottom > top && r.top < bottom) { t.classList.add("dz-seen"); io.unobserve(t); }
      });
    };
    let lastSweep = 0;
    const onScroll = () => {
      const now = performance.now();
      if (now - lastSweep > 400) { lastSweep = now; setTimeout(sweep, 450); }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); el.removeEventListener("scroll", onScroll); };
  }, [motion]);

  return (
    <>
    <div className="frost" aria-hidden="true" />
    <aside className={`panel${shown ? " open" : ""}`} aria-label="Portfolio">
      <span className="panel-rail" aria-hidden="true"><i ref={rail} /></span>
      <div className="panel-body" ref={body}>
        <div className="runway" aria-hidden="true" />
        <header className="dossier plate">
          <div className="plate-top mono">
            <span className="dossier-m" aria-hidden="true"><i /><i /><i /></span>
            Chassis // SJ-F90-DEV
          </div>
          <h1 className="dossier-name sr-only">Surya J, software developer</h1>
          <p className="plate-say"><b>Precision software.</b><em>M-Power architecture.</em></p>
          <dl className="plate-grid">
            <div><dt>Discipline</dt><dd>Android · Web · Backend</dd></div>
            <div><dt>Obsession</dt><dd>Hardcore automotive tuning</dd></div>
            <div><dt>Philosophy</dt><dd>Zero-jank, low-latency</dd></div>
            <div><dt>Status</dt><dd><i className="plate-live" aria-hidden="true" /> Active, shipping ({PROJECTS.length} builds)</dd></div>
          </dl>
          <p className="plate-note">
            Software developer by profession, <em className="carlove">hardcore car enthusiast</em> by obsession.
          </p>
          <p className="dossier-hint mono">Scroll, and the car follows</p>
        </header>
        <Services mobile={mobile} motion={motion} />
        <Experience mobile motion={motion} />
        <Background mobile motion={motion} />
        <Projects mobile={mobile} motion={motion} />
        <Credentials mobile motion={motion} />
        <Contact mobile motion={motion} />
      </div>
    </aside>
    </>
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
    <button ref={ref} className="heroname" onClick={home} aria-label="Surya J, back to the top">
      SURYA <span>J</span>
    </button>
  );
}

/* Who I am, decoded like an ECU booting. When the car's engine starts,
   every character of the line cycles through hex and terminal glyphs for a
   moment, then they lock left to right, each one flashing cyan as it lands,
   timed so the last one locks as the headlights first flash. A cursor rides
   the leading edge and pulses once the line is set. After a hold the role
   decodes to the next one. Every character sits in a cell sized by its
   final glyph, so the scramble never changes the line's width. */
const ROLES = ["Software developer", "Prompt engineer", "Car lover", "Gamer"];
const ROLE_PRE = "I’m a ";
const GLYPHS = "0123456789ABCDEF#_/\[]<>x";

function RoleDecoder() {
  const [i, setI] = useState(0);
  const line = useRef(null);
  const caret = useRef(null);
  const booted = useRef(false);
  const text = ROLE_PRE + ROLES[i];

  useEffect(() => {
    const el = line.current;
    const cells = [...el.querySelectorAll(".dc")];
    const glyph = cells.map((c) => c.querySelector(".dc-g"));
    const n = cells.length;
    const from = booted.current ? ROLE_PRE.length : 0;   // the prefix stays locked after the first run
    const hold = booted.current ? 2600 : 3400;
    let locked = from - 1, start = 0, B = 0, step = 0, raf = 0, timer = 0, lastScramble = 0, done = false;

    const caretTo = (k) => {
      const c = cells[Math.max(0, k)];
      const x = k < 0 ? c.offsetLeft : c.offsetLeft + c.offsetWidth;
      caret.current.style.transform = `translate3d(${x}px,0,0)`;
    };
    const finish = () => {
      done = true;
      caret.current.classList.add("idle");
      timer = setTimeout(() => { booted.current = true; setI((v) => (v + 1) % ROLES.length); }, hold);
    };
    const frame = (now) => {
      const t = now - start;
      if (now - lastScramble > 55) {
        lastScramble = now;
        for (let k = locked + 1; k < n; k += 1) {
          if (text[k] !== " ") glyph[k].textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
      }
      let moved = false;
      while (locked + 1 < n && t >= B + (locked + 1 - from) * step) {
        locked += 1;
        glyph[locked].textContent = "";
        cells[locked].classList.add("on");
        moved = true;
      }
      if (moved) caretTo(locked);
      if (locked === n - 1) { finish(); return; }
      raf = requestAnimationFrame(frame);
    };
    const begin = (burst, total) => {
      if (start) return;
      start = performance.now();
      B = burst;
      step = Math.max(18, (total - burst) / Math.max(1, n - from - 1));
      caret.current.classList.remove("idle");
      raf = requestAnimationFrame(frame);
    };
    // the headlights are on: whatever is left locks within a beat
    const onLights = () => {
      if (!start || done) return;
      const t = performance.now() - start;
      step = 160 / Math.max(1, n - 1 - locked);
      B = t - (locked + 1 - from) * step;
    };

    caretTo(from - 1);
    caret.current.classList.add("idle");          // a terminal waiting for the engine
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cells.forEach((c) => c.classList.add("on"));
      caretTo(n - 1);
      finish();
      return () => clearTimeout(timer);
    }
    let wait = 0;
    const onIgnition = (e) => begin(600, (e.detail && e.detail.lightsIn) || 2900);
    if (booted.current) begin(280, 280 + (n - from) * 42);
    else {
      window.addEventListener("car:ignition", onIgnition);
      window.addEventListener("car:lights", onLights);
      // no car (no WebGL, or it is still loading): decode on its own
      wait = setTimeout(() => begin(600, 600 + (n - from) * 70), 6000);
    }
    return () => {
      cancelAnimationFrame(raf); clearTimeout(timer); clearTimeout(wait);
      window.removeEventListener("car:ignition", onIgnition);
      window.removeEventListener("car:lights", onLights);
    };
  }, [i, text]);

  return (
    <p className="introhud-role">
      <span className="sr-only">{ROLES.join(", ")}</span>
      <span ref={line} className="dc-line" aria-hidden="true">
        {[...text].map((ch, k) => (
          <span key={`${i}-${k}`} className={`dc${k < ROLE_PRE.length ? " pre" : ""}${booted.current && k < ROLE_PRE.length ? " on still" : ""}`}>
            <span className="dc-f">{ch === " " ? " " : ch}</span>
            <span className="dc-g" />
          </span>
        ))}
        <span ref={caret} className="dc-caret" />
      </span>
    </p>
  );
}

/* The opening titles. Not a splash card over the canvas — a HUD in the
   corner, so the push-in plays in full behind it from the first frame. */
function IntroHud() {
  return (
    <div className="introhud">
      <span className="introhud-m"><i /><i /><i /></span>
      <h1 className="introhud-name">SURYA J</h1>
      <RoleDecoder />
      <p className="introhud-bio">
        I design and build Android apps, web platforms and AI tools that businesses run on
        every day. Away from the keyboard I&rsquo;m a <em className="carlove">hardcore car enthusiast</em> and
        a gamer, and I bring the same obsession with response and feel to everything I ship.
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
  .panel{position:fixed;top:0;bottom:0;left:50%;z-index:1050;
    --dock:min(1680px,calc(100vw - 2 * clamp(1rem,3vw,2.2rem)));   /* on the navbar's own inset */width:var(--dock);margin-left:calc(var(--dock) / -2);
    border:0;border-radius:0;box-shadow:none;background:transparent;
    display:flex;flex-direction:column;isolation:isolate;
    pointer-events:auto}
  /* nothing to touch until the car has parked */
  .panel:not(.open){visibility:hidden;pointer-events:none}
  /* A screen's height of empty runway above the dossier: at the top of the
     scroll the content sits just below the bottom edge, and it comes up
     exactly as far as you scroll, no further and no faster. */
  .panel .runway{height:var(--runway,100vh);flex:none}
  /* The frost is its own full-screen layer between the car and the
     dossier, outside the scrolling dock: a backdrop blur inside a fixed
     layer over a scroll container makes Chromium paint the dossier twice.
     Out here its only backdrop is the canvas, which redraws every frame.
     Light blur and a part-transparent tint: the car stays readable as a
     car, the words stay readable as words. */
  /* A full-screen vignette with a light blur: darkest behind the centred
     text, opening out toward the edges so the car stays a car. */
  /* Smoked glass over the whole screen: a light blur and a part-clear tint,
     a touch deeper at the edges and with no band anywhere, so the text can
     run across the middle and the car still moves visibly behind it. */
  :root{--wl:clamp(240px,25vw,340px)}
  .frost{position:fixed;inset:0;z-index:1040;pointer-events:none;opacity:var(--k,0);
    -webkit-backdrop-filter:blur(6px) saturate(1.05);backdrop-filter:blur(6px) saturate(1.05);
    background:linear-gradient(90deg,rgba(4,7,13,.68) 0%,rgba(4,7,13,.56) 30%,rgba(4,7,13,.48) 55%,rgba(4,7,13,.52) 80%,rgba(4,7,13,.6) 100%)}
  /* the words keep a soft dark halo so they hold over the white paint */
  .panel .panel-body{text-shadow:0 1px 14px rgba(2,4,8,.7)}
  @media (max-width:900px){.frost{background:rgba(4,7,13,.55)}}
  @media (max-width:900px){.panel{left:0;right:0;width:auto;margin-left:0}}
  /* --k runs 0 to 1 over the runway, smoothed, and drives everything that
     hands over from the hero to the dossier: the backing above fades in,
     the titles fade and rise, the name flies to its corner */
  /* the words stay well inside the feather, so nothing readable fades out */
  .panel .dossier{max-width:none;margin-inline:0;padding-inline:clamp(1.1rem,3vw,1.6rem)}

  /* the scroll position, as a hairline on the glass */
  .panel-rail{z-index:2;position:absolute;left:-16px;top:4.6rem;bottom:1.2rem;width:1px;border-radius:1px;
    background:rgba(255,255,255,.08);overflow:hidden;pointer-events:none;z-index:3}
  .panel-rail i{display:block;width:100%;height:100%;transform-origin:50% 0;transform:scaleY(.06);
    background:rgba(255,255,255,.4)}
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
  .introhud-role{margin-top:1rem;display:flex;align-items:center;gap:.4em;white-space:nowrap;
    font:500 clamp(1.05rem,1.7vw,1.3rem)/1.2 ${FONT.sans};letter-spacing:-.005em;color:rgba(238,244,255,.6);
    text-shadow:0 1px 20px rgba(0,0,0,.8);animation:introRise 1.1s ${EASE.out} .45s both}
  .dc-line{position:relative;display:inline-block;white-space:nowrap}
  .dc{position:relative;display:inline-block}
  .dc-f{visibility:hidden;color:#fff;font-weight:600}
  .dc.pre .dc-f{font-weight:500}
  .dc.on .dc-f{visibility:visible;animation:dcLock .38s ease-out both}
  .dc.still .dc-f{animation:none}
  /* the scramble glyph: centred in the final character's cell */
  .dc-g{position:absolute;left:50%;top:50%;transform:translate(-50%,-52%);
    font:500 .82em/1 ${FONT.mono};color:rgba(125,211,252,.72);text-shadow:0 0 8px rgba(56,189,248,.35);pointer-events:none}
  @keyframes dcLock{
    0%{color:#e6f7ff;text-shadow:0 0 10px rgba(56,189,248,.6),-1px 0 0 rgba(255,40,90,.4),1px 0 0 rgba(0,210,255,.5)}
    100%{color:#fff;text-shadow:0 1px 20px rgba(0,0,0,.8)}}
  .dc-caret{position:absolute;left:0;top:50%;width:2px;height:1.1em;margin:-.55em 0 0 2px;border-radius:1px;background:#38bdf8;
    box-shadow:0 0 10px rgba(56,189,248,.6);transition:transform 70ms linear;will-change:transform}
  .dc-caret.idle{animation:dcPulse 1.6s ease-in-out infinite}
  @keyframes dcPulse{50%{opacity:.25;box-shadow:0 0 4px rgba(56,189,248,.3)}}
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
  .panel-body{margin-top:4.6rem}
  @media (max-width:900px){.panel-body{margin-top:3.9rem}}
  .sr-only{position:absolute !important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;
    clip-path:inset(50%);white-space:nowrap;border:0}

  /* text dissolves as it reaches the top of the dossier instead of being
     sliced off by the edge of the scroll area, and eases out at the foot */
  .panel-body{-webkit-mask-image:linear-gradient(180deg,transparent 0%,#000 8%,#000 90%,transparent 100%);
    mask-image:linear-gradient(180deg,transparent 0%,#000 8%,#000 90%,transparent 100%)}
  .panel-body{position:relative;z-index:1;flex:1 1 0;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;
    -webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none}
  .panel-body::-webkit-scrollbar{display:none;width:0;height:0}
  /* dz-: the site's own Reveal already owns .rv/.in */
  .panel .dz-rv{opacity:0;translate:0 18px;
    transition:opacity .7s cubic-bezier(.16,1,.3,1) var(--rd,0ms),translate .7s cubic-bezier(.16,1,.3,1) var(--rd,0ms)}
  .panel .dz-rv.dz-seen{opacity:1;translate:0 0}

  /* ── a project, open in its row ── */
  .panel #projects .fx-grid > *{display:flex;flex-direction:column}
  .pcard[aria-expanded="true"]{background:rgba(56,189,248,.06) !important;box-shadow:inset 2px 0 0 #0066B1 !important}
  .pcard-open{transition:transform .35s cubic-bezier(.16,1,.3,1),color .25s ease !important}
  .pcard[aria-expanded="true"] .pcard-open{transform:rotate(45deg);color:#38bdf8 !important}
  .pd-x{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,6fr);column-gap:2.4rem;padding:.4rem 20px 1.8rem;
    border-bottom:1px solid rgba(255,255,255,.08)}
  .pd-head{display:grid;gap:1rem;align-content:start}
  .pd-sub{margin:0;font-size:.92rem !important;color:rgba(255,255,255,.6)}
  .pd-preview{height:130px;border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;
    overflow:hidden;background:rgba(255,255,255,.02)}
  .pd-preview > div{height:86% !important;width:auto !important}
  .pd-preview svg{height:100% !important;width:100% !important}
  .pd-meta{display:grid;grid-template-columns:1fr 1fr;row-gap:.75rem;column-gap:1.2rem;margin:0;padding-top:.8rem;
    border-top:1px solid rgba(255,255,255,.1)}
  .pd-meta dt{font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:.2rem}
  .pd-meta dd{margin:0;font-size:.8rem;line-height:1.4;color:#e6edf6}
  .pd-row{display:grid;grid-template-columns:11rem minmax(0,1fr);gap:1.2rem;padding:1rem 0;border-bottom:1px solid rgba(255,255,255,.06)}
  .pd-row:first-child{padding-top:0}
  .pd-row:last-child{border-bottom:0}
  .pd-label{font-size:.64rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.45);padding-top:.25rem}
  .pd-row p{margin:0;color:#c9d5e3}
  .pd-row p + p{margin-top:.7rem}
  .pd-row strong{color:#f1f6ff;font-weight:600}
  .pd-link{display:inline-flex;align-items:center;gap:.4rem;font-size:.85rem;color:#fff;
    text-decoration:underline;text-decoration-color:rgba(255,255,255,.35);text-underline-offset:.3em;
    transition:text-decoration-color .25s ease}
  .pd-link:hover{text-decoration-color:#fff}
  @media (max-width:900px){
    .pd-x{grid-template-columns:1fr;row-gap:1.2rem;padding:.4rem 12px 1.4rem}
    .pd-preview{display:none}
    .pd-row{grid-template-columns:1fr;gap:.45rem}
  }
  .panel .sec{padding:1.4rem 0}
  .panel .sec > .wrap{background:transparent;border:0;border-radius:0;backdrop-filter:none;-webkit-backdrop-filter:none;
    box-shadow:none;padding-block:0;padding-inline:clamp(1.1rem,3vw,1.6rem);
    max-width:none;margin-inline:0}
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

  /* Project cards: a schematic banner, then index and category, the
     name, one line of what it is, the client, the stack, and an "Open"
     that answers the hover. Equal height across a row. */
  .panel #projects .wrap > div[style*="grid"] > *{display:flex}
  .panel .pcard{display:flex;flex-direction:column;flex:1;gap:.42rem;padding:.7rem .7rem 1rem;border-radius:14px;
    border:1px solid rgba(255,255,255,.08);background:rgba(8,12,22,.38);text-align:left;
    transition:border-color .3s ease,transform .45s cubic-bezier(.16,1,.3,1),background-color .3s ease,box-shadow .45s ease}
  .panel .pcard:hover{border-color:rgba(56,189,248,.45);transform:translate3d(0,-3px,0);
    background:rgba(56,189,248,.05);box-shadow:0 18px 40px -18px rgba(0,0,0,.7),0 0 0 1px rgba(56,189,248,.08)}
  .panel .pcard > .fx{order:0}
  .panel .pcard .pcard-art{display:block;height:120px;padding:5% 12%;margin-bottom:.3rem;border-radius:10px}
  .panel .pcard-head{order:1;display:flex;align-items:center;justify-content:space-between;gap:.6rem;
    padding:0 .3rem;font-size:.6rem;letter-spacing:.14em;text-transform:uppercase}
  .panel .pcard-idx{color:#38bdf8}
  .panel .pcard-cat{color:#8ea6c2;padding:.12rem .45rem;border:1px solid rgba(255,255,255,.1);border-radius:999px}
  .panel .pcard-name{order:2;margin-top:0 !important;padding:0 .3rem;font-size:1.08rem !important;color:#f1f6ff !important}
  .panel .pcard-tag{order:3;padding:0 .3rem;font-size:.84rem;line-height:1.45;color:#9fb3cc;
    display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .panel .pcard-for{order:4;margin-top:.1rem !important;padding:0 .3rem;font-size:.62rem !important;letter-spacing:.12em;
    text-transform:uppercase;color:#7f97b5 !important}
  .panel .pcard > .mono:not(.pcard-for):not(.pcard-head):not(.pcard-open){order:5;margin-top:0 !important;padding:0 .3rem;
    font-size:.62rem !important;letter-spacing:.12em;text-transform:uppercase;color:#38bdf8 !important}
  .panel .pcard-open{order:6;margin-top:auto;padding:.55rem .3rem 0;font-size:.6rem;letter-spacing:.16em;text-transform:uppercase;
    color:#7dd3fc;opacity:.55;transition:opacity .3s ease}
  .panel .pcard-open i{font-style:normal;display:inline-block;transition:transform .35s cubic-bezier(.16,1,.3,1)}
  .panel .pcard:hover .pcard-open{opacity:1}
  .panel .pcard:hover .pcard-open i{transform:translate3d(4px,0,0)}
  .panel .pcard:hover .pcard-name{color:#bae6fd !important}
  /* solid blue pills and active filters become M-telemetry tags */
  .panel .pill{background:rgba(56,189,248,.1);color:#7dd3fc;border:1px solid rgba(56,189,248,.35)}
  .panel .chip{background:rgba(15,23,42,.6);border-color:rgba(255,255,255,.08)}
  .panel .chip.on{background:rgba(56,189,248,.14);border-color:rgba(56,189,248,.55);color:#bae6fd}
  .panel .tag{background:rgba(15,23,42,.6);border-color:rgba(255,255,255,.08);color:#b9cce4}
  .panel #projects .wrap > div[style*="grid"]{gap:1.25rem !important}
  .panel .sec h2{font-size:clamp(1.8rem,5vw,2.6rem) !important}

  /* ── the spec plate ── */
  .panel .plate{max-width:min(380px,calc(var(--wl) + 30px))}
  .plate-top{display:flex;align-items:center;gap:.7rem;font:600 11px/1.2 ${FONT.sans} !important;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.5)}
  .plate-top .dossier-m{margin:0}
  .plate-say{margin:1rem 0 1.1rem;font-size:26px !important;line-height:1.12 !important}
  .plate-say b{display:block;font-family:${FONT.name};font-weight:600;letter-spacing:.01em;text-transform:uppercase;color:#fff}
  .plate-say em{display:block;font-family:${FONT.serif};font-style:italic;font-weight:400;color:#38bdf8}
  .plate-grid{display:grid;grid-template-columns:1fr 1fr;margin:0;border:1px solid rgba(255,255,255,.08)}
  .plate-grid > div{padding:.7rem .8rem;border-right:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08)}
  .plate-grid > div:nth-child(2n){border-right:0}
  .plate-grid > div:nth-child(n+3){border-bottom:0}
  .plate-grid dt{font-size:.58rem;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.42);margin-bottom:.25rem}
  .plate-grid dd{margin:0;font-size:.82rem;line-height:1.35;color:#e6edf6}
  .plate-live{display:inline-block;width:6px;height:6px;border-radius:50%;background:#22c55e;margin-right:.3rem;vertical-align:middle;
    box-shadow:0 0 8px rgba(34,197,94,.7)}
  .panel .plate-note{margin:.9rem 0 0;font-size:13px !important;line-height:1.55 !important;color:#94a3b8}
  .panel .plate .dossier-hint{border-top:0;margin-top:1.4rem}

  /* ── split-wing sections: a left wing, the car, a right wing ── */
  @media (min-width:901px){
    .panel #services .wrap > div[style*="grid"]{grid-template-columns:320px minmax(320px,1fr) 400px !important;gap:0 !important}
    .panel #services .wrap > div[style*="grid"] > :last-child{grid-column:3}
    .panel .sec > .wrap:has(> .sec-head){grid-template-columns:320px minmax(320px,1fr) 400px !important;column-gap:0 !important}
    .panel .sec-body{grid-column:3}
    .panel .sec-head .disp,.panel #services .disp{font-size:clamp(2.4rem,3vw,3.2rem) !important}
    /* the list wings carry no full-width rules across the car */
    .panel #experience .sec-body > div{border-bottom:0 !important}
  }

  /* ── telemetry modules: "What I do" and Experience ── */
  .panel .svc{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:.5rem .8rem;margin-bottom:.5rem;
    padding:16px 20px;background:rgba(8,12,22,.72);border:1px solid rgba(255,255,255,.07);border-left:2px solid rgba(56,189,248,.35);
    border-top:1px solid rgba(255,255,255,.07) !important;opacity:1 !important;cursor:default;outline:none;
    transition:border-color .3s ease,background-color .3s ease}
  .panel .svc-i{font-size:11px !important;color:#38bdf8 !important;letter-spacing:.06em}
  .panel .svc-s{justify-self:end;text-align:right;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.55)}
  .panel .svc-n{grid-column:1/-1;font-family:${FONT.sans};font-weight:600;font-size:20px;letter-spacing:-.02em;line-height:1.2;color:#fff;
    text-align:left;transform:none !important;transition:transform .35s cubic-bezier(.16,1,.3,1)}
  .panel .svc-x{grid-column:1/-1;display:block;max-height:0;overflow:hidden;opacity:0;font-size:.84rem;line-height:1.5;color:#a8b8cc;
    transition:max-height .45s cubic-bezier(.16,1,.3,1),opacity .35s ease}
  .panel .svc[data-d="0"]{border-left-color:rgba(56,189,248,.8)}
  .panel .svc:hover,.panel .svc:focus-within,.panel .svc:focus{border-left-color:#38bdf8;background:rgba(10,16,30,.85)}
  .panel .svc:hover .svc-n,.panel .svc:focus .svc-n{transform:translate3d(4px,0,0) !important}
  .panel .svc:hover .svc-x,.panel .svc:focus .svc-x{max-height:4.5em;opacity:1}
  .panel .svc:focus-visible{box-shadow:0 0 0 2px rgba(56,189,248,.5)}
  .panel #experience .row{margin-bottom:.5rem;padding:4px 20px;background:rgba(8,12,22,.72);border:1px solid rgba(255,255,255,.07);
    border-left:2px solid rgba(56,189,248,.35);transition:border-color .3s ease}
  .panel #experience .row:hover,.panel #experience .row:focus-within{border-left-color:#38bdf8}
  .panel #experience .row-t{font-size:20px !important;letter-spacing:-.02em !important}

  /* ── projects: a three-wide telemetry index ── */
  .panel .pcard{background:rgba(8,12,22,.78) !important;position:relative}
  .panel .pcard .fx,.panel .pcard-tag,.panel .pcard-for{display:none !important}
  .panel .pcard-open{position:absolute;top:.85rem;right:1rem;margin:0 !important;padding:0 !important;font-size:.9rem !important;opacity:.45}
  .panel .pcard-head{padding-right:1.6rem !important}
  .panel .pcard-idx{font-variant-numeric:tabular-nums}

  /* ═══ Motorsport spec-ledger ═══
     Every plate (services, experience, projects) is a sharp, near-opaque
     plate with two laser-cut corners, a brighter top edge, a reference line,
     a stark title and a monospace ledger. Hover: the edge flashes M-cyan,
     a crosshair lights in the corner, the plate lifts 2px, with no easing. */
  .panel{--cut:9px;font-variant-numeric:tabular-nums}
  .panel .svc,.panel #experience .row,.panel .pcard{
    position:relative;border-radius:0 !important;box-shadow:none !important;
    background:rgba(4,7,12,.94) !important;
    border:1px solid rgba(255,255,255,.12) !important;border-top:1px solid rgba(255,255,255,.25) !important;
    clip-path:polygon(0 0,calc(100% - var(--cut)) 0,100% var(--cut),100% 100%,var(--cut) 100%,0 calc(100% - var(--cut)));
    transition:none !important}
  .panel .svc::after,.panel #experience .row::after,.panel .pcard::after{
    content:"+";position:absolute;top:.35rem;right:.95rem;font:400 13px/1 ui-monospace,SFMono-Regular,Menlo,monospace;
    color:#38bdf8;opacity:0}
  .panel .svc:hover,.panel .svc:focus,.panel #experience .row:hover,.panel #experience .row:focus-within,.panel .pcard:hover,.panel .pcard:focus-visible{
    border-color:#38bdf8 !important;transform:translate3d(0,-2px,0) !important}
  .panel .svc:hover::after,.panel .svc:focus::after,.panel #experience .row:hover::after,.panel #experience .row:focus-within::after,
  .panel .pcard:hover::after,.panel .pcard:focus-visible::after{opacity:1}
  .panel .svc[data-d="0"]{border-top-color:#38bdf8 !important}
  /* the reference line */
  .panel .svc-i,.panel .pcard-head,.panel #experience .row::before{
    font:500 10px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace !important;letter-spacing:.18em !important;
    text-transform:uppercase;color:rgba(255,255,255,.4) !important}
  .panel #experience .sec-body{counter-reset:xp}
  .panel #experience .row{counter-increment:xp;padding:14px 20px 4px !important}
  .panel #experience .row::before{content:"[ REF: 0" counter(xp) " // EXP ]";display:block}
  /* titles */
  .panel .svc-n,.panel .pcard-name,.panel #experience .row-t{
    font-size:20px !important;font-weight:700 !important;letter-spacing:-.02em !important;color:#fff !important}
  /* services: reference, title, readout, then the stack as the ledger */
  .panel .svc{grid-template-columns:1fr !important;gap:.45rem !important;padding:14px 20px 12px !important}
  .panel .svc-i{grid-row:1}
  .panel .svc-n{grid-row:2;grid-column:1 !important;justify-self:start !important;text-align:left}
  .panel .svc-x{grid-row:3;grid-column:1 !important;font-size:14px !important;line-height:1.6 !important;color:rgba(255,255,255,.75) !important}
  .panel .svc-s{grid-row:4;justify-self:stretch !important;text-align:left !important;
    border-top:1px solid rgba(255,255,255,.08);padding-top:10px;
    font:500 11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace !important;letter-spacing:.06em !important;
    text-transform:none !important;color:#38bdf8 !important}
  .panel .svc-s::before{content:"STACK";color:rgba(255,255,255,.35);margin-right:1rem;letter-spacing:.14em}
  /* projects: reference, title, ledger */
  .panel .pcard{padding:14px 20px 12px !important;gap:.5rem !important}
  .panel .pcard-head{order:1;display:block !important;padding:0 !important}
  .panel .pcard-name{order:2;padding:0 !important}
  .panel .pcard-ledger{order:3;display:flex;gap:1rem;margin-top:.35rem;padding-top:10px;border-top:1px solid rgba(255,255,255,.08);
    font:500 11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;color:#38bdf8}
  .panel .pcard-ledger span:first-child{color:rgba(255,255,255,.35);letter-spacing:.14em}
  .panel .pcard-open{display:none !important}
  .panel .pcard:hover .pcard-name{color:#fff !important}

  /* headings: heavy and tight; no bar beside them */
  .panel .sec-head,.panel #services .wrap > div[style*="grid"] > :first-child{border-left:0;padding-left:0}
  .panel .disp{font-weight:800 !important;letter-spacing:-.04em !important}
  /* body copy: neutral, readable, no decoration */
  .panel .panel-body p,.panel .panel-body li{font-size:14px !important;line-height:1.6 !important;color:rgba(255,255,255,.75)}
  /* labels and filters: flat type, no pills */
  .panel .pill{background:none !important;border:0 !important;border-radius:0 !important;padding:0 !important;
    font:600 11px/1.2 ${FONT.sans} !important;letter-spacing:.16em !important;text-transform:uppercase;color:rgba(255,255,255,.55) !important}
  .panel .chip{background:none !important;border:0 !important;border-radius:0 !important;border-bottom:1px solid transparent !important;
    padding:.35rem .1rem !important;margin-right:1rem;color:rgba(255,255,255,.5) !important;
    font:500 13px/1.3 ${FONT.sans} !important;letter-spacing:0 !important;text-transform:none !important}
  .panel .chip.on{color:#fff !important;border-bottom-color:#38bdf8 !important}
  .panel .tag{background:none !important;border:0 !important;border-radius:0 !important;padding:0 .6rem 0 0 !important;color:#38bdf8 !important}

  /* ═══ Telemetry ledger ═══
     Projects, services and experience are rows, not boxes: an etched
     hairline under each, the index and title on the left, the stack and an
     arrow on the right. Hover tints the row, lights a 2px M-blue edge and
     slides the title. The plates' boxes, cuts and crosshairs are undone. */
  .panel .svc,.panel #experience .row,.panel .pcard{
    background:transparent !important;border:0 !important;border-bottom:1px solid rgba(255,255,255,.08) !important;
    clip-path:none !important;margin:0 !important;transform:none !important;box-shadow:none !important;
    transition:background-color .25s ease,box-shadow .25s ease !important}
  .panel .svc::after,.panel #experience .row::after,.panel .pcard::after{content:none !important}
  .panel .svc:hover,.panel .svc:focus,.panel #experience .row:hover,.panel #experience .row:focus-within,
  .panel .pcard:hover,.panel .pcard:focus-visible{
    background:rgba(56,189,248,.06) !important;box-shadow:inset 2px 0 0 #0066B1 !important;transform:none !important}
  .panel .svc[data-d="0"]{box-shadow:inset 2px 0 0 rgba(0,102,177,.6) !important}
  /* the index: the stencil face of the name, not a code font in brackets */
  .panel .panel-body .svc-i,.panel .panel-body .pcard-head,.panel #experience .row::before{
    font-family:${FONT.name} !important;font-weight:600 !important;font-size:22px !important;line-height:1 !important;
    letter-spacing:.02em !important;font-variant-numeric:tabular-nums;color:rgba(255,255,255,.32) !important;text-transform:none;min-width:2ch}
  .panel .svc:hover .svc-i,.panel .pcard:hover .pcard-head,.panel #experience .row:hover::before{color:#fff !important}
  .panel #experience .row::before{content:"0" counter(xp) !important}
  /* titles */
  .panel .svc-n,.panel .pcard-name,.panel #experience .row-t{font-size:17px !important;font-weight:700 !important;
    letter-spacing:-.02em !important;color:#fff !important;transition:transform .3s cubic-bezier(.16,1,.3,1) !important}
  .panel .svc:hover .svc-n,.panel .svc:focus .svc-n,.panel .pcard:hover .pcard-name,.panel #experience .row:hover .row-t{
    transform:translate3d(4px,0,0) !important}

  /* projects: [01] | title over client | stack | arrow */
  .panel #projects .fx-grid{grid-template-columns:1fr !important;gap:0 !important;max-width:none}
  .panel .pcard{display:grid !important;grid-template-columns:auto minmax(0,1fr) auto auto;column-gap:1.1rem;row-gap:.15rem;
    align-items:center;padding:16px 20px !important;flex:none !important}
  .panel .pcard-head{grid-column:1;grid-row:1 / span 2;order:0 !important;align-self:center}
  .panel .pcard-name{grid-column:2;grid-row:1;order:0 !important;margin:0 !important}
  .panel .pcard-for{display:block !important;grid-column:2;grid-row:2;order:0 !important;margin:0 !important;padding:0 !important;
    font:400 12px/1.4 inherit !important;font-family:inherit !important;letter-spacing:.02em !important;text-transform:none !important;color:rgba(255,255,255,.55) !important}
  .panel .pcard-for span{color:rgba(255,255,255,.55) !important}
  .panel .pcard-ledger{grid-column:3;grid-row:1 / span 2;order:0 !important;margin:0 !important;padding:0 !important;border:0 !important;
    font:400 12.5px/1.4 ${FONT.sans} !important;letter-spacing:0;text-transform:none;color:rgba(255,255,255,.5) !important;
    text-align:right}
  .panel .pcard-open{display:block !important;position:static !important;grid-column:4;grid-row:1 / span 2;opacity:1 !important;
    font-size:14px !important;color:rgba(255,255,255,.4);transition:color .25s ease}
  .panel .pcard:hover .pcard-open{color:#38bdf8}

  /* services: [01] | title (readout opens beneath) | stack | + */
  .panel .svc{grid-template-columns:auto minmax(0,1fr) auto !important;column-gap:1.1rem !important;row-gap:.3rem !important;
    padding:16px 20px !important;align-items:center}
  .panel .svc-i{grid-column:1;grid-row:1}
  .panel .svc-n{grid-column:2 !important;grid-row:1}
  .panel .svc-s{grid-column:3;grid-row:1;border:0 !important;padding:0 !important;
    font:400 12.5px/1.4 ${FONT.sans} !important;letter-spacing:0 !important;
    text-transform:none !important;color:rgba(255,255,255,.5) !important;justify-self:end !important;text-align:right !important}
  .panel .svc-s::before{content:none !important}
  .panel .svc-x{grid-column:2 / -1 !important;grid-row:2}
  /* experience: the row keeps its own toggle; it just loses the box */
  .panel #experience .row{padding:12px 20px 0 !important}

  /* desktop: the title on the left, and the list across the middle and
     right, over the glass, so the car runs behind the words */
  @media (min-width:901px){
    .panel #services .wrap > div[style*="grid"]{grid-template-columns:var(--wl) minmax(0,1fr) !important;column-gap:clamp(2rem,4vw,4rem) !important}
    .panel #services .wrap > div[style*="grid"] > :last-child{grid-column:2}
    .panel .sec > .wrap:has(> .sec-head){grid-template-columns:var(--wl) minmax(0,1fr) !important;column-gap:clamp(2rem,4vw,4rem) !important}
    .panel .sec-body{grid-column:2}
    .panel #projects .fx-grid{max-width:none}
  }
  /* phones: everything stacks; the stack wraps under the title */
  @media (max-width:767px){
    .panel .sec > .wrap,.panel .dossier{padding-inline:16px !important}
    .panel .pcard{grid-template-columns:auto minmax(0,1fr) auto;padding:14px 12px !important}
    .panel .pcard-ledger{grid-column:2 / -1;grid-row:3;text-align:left;white-space:normal}
    .panel .pcard-head{grid-row:1}
    .panel .pcard-open{grid-column:3;grid-row:1}
    .panel .svc{grid-template-columns:auto minmax(0,1fr) !important;padding:14px 12px !important}
    .panel .svc-s{grid-column:2;grid-row:2;justify-self:start !important;text-align:left !important}
    .panel .svc-x{grid-row:3}
    :root.lifted .car-stage{opacity:.35 !important;transition:opacity .6s ease}
  }


  /* desktop: the content edges sit on the navbar's edges, and each section
     reads as a sticky title on the left with its content across the right */
  @media (min-width:901px){
    .panel .sec > .wrap,.panel .dossier{padding-inline:0 !important}
    .panel #projects .fx-grid{grid-template-columns:1fr !important;gap:0 !important;max-width:none}
  }
  @media (min-width:901px){
    .panel .sec > .wrap:has(> .sec-head){display:grid;align-items:start}
    .panel .sec-head{position:sticky;top:1.5rem}
    .panel .sec-head .disp{font-size:clamp(2.6rem,3.4vw,3.6rem) !important}
    .panel .sec-body{min-width:0}
  }
  @media (max-width:900px){
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
