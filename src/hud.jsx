import { useEffect, useRef, useState } from "react";
import { T, FONT, EASE } from "./theme.js";

/* ─────────────────────────────────────────────────────────
   THE COCKPIT

   The section rail, read as an M5 CS instrument binnacle: a
   tachometer arc hugging the right edge, the sections sitting on
   it as nodes, and a telemetry block reading the scroll as gear,
   speed and revs.

   Everything except the active section is written straight to the
   SVG from one rAF loop. Putting scroll velocity in React state
   would re-render this tree sixty times a second on a page that is
   already running a car, particles and smoke; the needle is a
   couple of attribute writes instead, and the readouts are only
   touched when the number they show actually changes.
   ───────────────────────────────────────────────────────── */

/* An eight-speed M Steptronic. The car parks on the hero, so the
   first stop is P and the box works up from there. */
const GEARS = ["P", "1", "2", "3", "4", "5", "6", "7"];
const TOP_SPEED = 305;        // km/h, M5 CS with the M Driver's Package
const REDLINE = 8.5;          // ×1000 rpm

/* The arc. Its centre sits off-screen to the right, so what shows is
   a shallow curve down the edge of the window. */
const W = 170, H = 360;
const CX = 362, CY = 180, R = 252;   // CX-R is the hollow the readout sits in
const TOP = 212, BOT = 148;             // degrees: the track runs top to bottom
const SPAN = TOP - BOT;
const TICKS = 29;
const REDLINE_FROM = 0.82;              // the last stretch of track goes red

const pt = (deg, rad = R) => {
  const a = (deg * Math.PI) / 180;
  return [CX + rad * Math.cos(a), CY + rad * Math.sin(a)];
};
const angleAt = (t) => TOP - t * SPAN;
const ARC_LEN = (SPAN * Math.PI * R) / 180;
const LABEL_X = CX - R - 6;             // just clear of the leftmost point
const [SX, SY] = pt(TOP);
const [EX, EY] = pt(BOT);
const ARC = `M ${SX} ${SY} A ${R} ${R} 0 0 0 ${EX} ${EY}`;

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function Hud({ items, go, active, reduced }) {
  const found = items.findIndex(([, id]) => id === active);
  const idx = found < 0 ? 0 : found;
  const [hover, setHover] = useState(null);

  const arc = useRef(null);
  const needle = useRef(null);
  const kmh = useRef(null);
  const rpm = useRef(null);
  const ticks = useRef([]);
  const dots = useRef([]);
  const tops = useRef([]);
  const live = useRef(0);
  live.current = idx;

  // The stops are spaced evenly round the dial, but the sections are not
  // spaced evenly down the page. Measuring where each one starts lets the
  // needle run on section progress instead of raw pixels, so it reaches a
  // stop exactly when that section does.
  useEffect(() => {
    const measure = () => {
      tops.current = items.map(([, id]) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : 0;
      });
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(document.body);
    return () => {
      window.removeEventListener("resize", measure);
      if (ro) ro.disconnect();
    };
  }, [items]);

  useEffect(() => {
    let raf = 0;
    let vel = 0;
    let lastY = window.scrollY;
    let lit = -1;              // how many ticks are lit
    let shownKmh = -1;
    let shownRpm = "";
    let shownP = -1;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const y = window.scrollY;
      const moved = Math.abs(y - lastY);
      lastY = y;
      // the needle kicks with the wheel and falls back on its own
      vel = reduced ? 0 : Math.max(vel * 0.88, Math.min(60, moved * 1.5));
      if (vel < 0.5) vel = 0;

      const stops = tops.current;
      let p;
      if (stops.length > 1) {
        let i = 0;
        while (i < stops.length - 1 && y >= stops[i + 1] - 1) i += 1;
        if (i >= stops.length - 1) p = 1;
        else p = clamp01((i + clamp01((y - stops[i]) / Math.max(1, stops[i + 1] - stops[i]))) / (stops.length - 1));
      } else {
        p = clamp01(y / max);
      }
      if (Math.abs(p - shownP) < 0.0002 && vel === 0) return;   // nothing moved
      shownP = p;

      if (arc.current) arc.current.style.strokeDashoffset = (ARC_LEN * (1 - p)).toFixed(2);
      if (needle.current) {
        const [nx, ny] = pt(angleAt(p));
        needle.current.setAttribute("cx", nx.toFixed(2));
        needle.current.setAttribute("cy", ny.toFixed(2));
      }

      // the ticks only change when the needle crosses one
      const crossed = Math.round(p * (TICKS - 1));
      if (crossed !== lit) {
        lit = crossed;
        for (let i = 0; i < ticks.current.length; i += 1) {
          const el = ticks.current[i];
          if (el) el.style.opacity = i <= crossed ? "1" : ".4";
        }
      }

      // the stops behind the needle are lit; the active one is left to the
      // stylesheet, which knows it is the one being read
      for (let i = 0; i < dots.current.length; i += 1) {
        const el = dots.current[i];
        if (!el) continue;
        if (i === live.current) { el.style.fill = ""; continue; }
        const at = dots.current.length > 1 ? i / (dots.current.length - 1) : 0;
        el.style.fill = at <= p ? "#2563eb" : "";
      }

      const speed = Math.min(TOP_SPEED, Math.round(p * 280 + vel));
      if (speed !== shownKmh && kmh.current) {
        shownKmh = speed;
        kmh.current.textContent = String(speed).padStart(3, "0");
      }
      const revs = Math.min(REDLINE, p * 7.2 + (vel / 60) * 1.3).toFixed(1);
      if (revs !== shownRpm && rpm.current) {
        shownRpm = revs;
        rpm.current.textContent = revs;
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  return (
    <nav className="hud" aria-label="Sections">
      {/* the telemetry: what the scroll reads as, on the inside of the curve */}
      <div className={`hud-tel${hover === null ? "" : " back"}`} aria-hidden="true">
        <span className="hud-stripes"><i /><i /><i /></span>
        <span className="hud-gear-row">
          <span className="hud-cap">GEAR</span>
          <span className="hud-gear">{GEARS[idx] || String(idx + 1)}</span>
        </span>
        <span className="hud-speed-row">
          <span className="hud-kmh" ref={kmh}>000</span>
          <span className="hud-unit">KM/H</span>
        </span>
        <span className="hud-rev">
          <span ref={rpm}>0.0</span> <span className="hud-red">×1000 RPM</span>
        </span>
      </div>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="mpower" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="65%" stopColor="#2563eb" />
            <stop offset="85%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* the scale */}
        {Array.from({ length: TICKS }, (_, i) => {
          const t = i / (TICKS - 1);
          const a = angleAt(t);
          const major = i % 4 === 0;
          const [x1, y1] = pt(a, R + (major ? 9 : 5.5));
          const [x2, y2] = pt(a, R + 2);
          return (
            <line
              key={i}
              ref={(el) => { ticks.current[i] = el; }}
              x1={x1} y1={y1} x2={x2} y2={y2}
              className={`hud-tick${t > REDLINE_FROM ? " red" : ""}${major ? " maj" : ""}`}
              style={{ opacity: 0.4 }}
            />
          );
        })}

        <path className="hud-track" d={ARC} />
        <path
          className="hud-fill"
          ref={arc}
          d={ARC}
          strokeDasharray={ARC_LEN}
          style={{ strokeDashoffset: ARC_LEN }}
        />
        <circle className="hud-needle" ref={needle} cx={SX} cy={SY} r={5} />

        {/* the stops */}
        {items.map(([label, id], i) => {
          const t = items.length > 1 ? i / (items.length - 1) : 0;
          const a = angleAt(t);
          const [x, y] = pt(a);
          const ly = pt(a)[1];
          const on = i === idx;
          const over = i === hover;
          return (
            <g
              key={id}
              className={`hud-stop${on ? " on" : ""}`}
              onClick={() => go(id)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover((h) => (h === i ? null : h))}
              onFocus={() => setHover(i)}
              onBlur={() => setHover((h) => (h === i ? null : h))}
              role="button"
              tabIndex={0}
              aria-label={label}
              aria-current={on ? "true" : undefined}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(id); } }}
            >
              <circle cx={x} cy={y} r={14} fill="transparent" />
              <circle className="hud-dot" ref={(el) => { dots.current[i] = el; }} cx={x} cy={y} r={over ? 5 : on ? 6 : 3.5} />
              {over && (
                <text className="hud-label" x={LABEL_X} y={ly + 3} textAnchor="end">{label}</text>
              )}
            </g>
          );
        })}
      </svg>
    </nav>
  );
}

export const HUD_CSS = `
  .hud{position:fixed;right:clamp(.4rem,1vw,1rem);top:4.6rem;z-index:1001;width:${W}px;height:${H}px;pointer-events:none}
  .hud svg{position:absolute;inset:0;overflow:visible}

  .hud-track{fill:none;stroke:${T.line2};stroke-width:4;stroke-linecap:round}
  .hud-fill{fill:none;stroke:url(#mpower);stroke-width:4;stroke-linecap:round;filter:drop-shadow(0 0 6px rgba(56,189,248,.55));transition:stroke-dashoffset .12s linear}
  .hud-tick{stroke:${T.line2};stroke-width:1;transition:opacity .3s ease}
  .hud-tick.maj{stroke:${T.muted};stroke-width:1.5}
  .hud-tick.red{stroke:#E30613}
  .hud-needle{fill:#fbbf24;stroke:${T.bg};stroke-width:1;filter:drop-shadow(0 0 7px rgba(251,191,36,.9))}

  .hud-stop{pointer-events:auto;cursor:pointer}
  .hud-stop:focus{outline:none}
  .hud-dot{fill:#334155;stroke:${T.bg};stroke-width:1.5;transition:fill .3s ease,r .4s ${EASE.spring}}
  .hud-stop:hover .hud-dot{fill:#38bdf8}
  .hud-stop.on .hud-dot{fill:#38bdf8;stroke:${T.surface};filter:drop-shadow(0 0 8px rgba(56,189,248,.9))}
  .hud-stop:focus-visible .hud-dot{stroke:${T.blue};stroke-width:2}
  .hud-label{font-family:${FONT.mono};font-size:10px;letter-spacing:.2em;text-transform:uppercase;fill:${T.navy};paint-order:stroke;stroke:${T.bg};stroke-width:3px;stroke-linejoin:round}

  /* the readout sits in the hollow of the arc, on a panel of its own so
     it stays legible over whatever the car is doing behind it */
  .hud-tel{position:absolute;right:${W - (CX - R) + 8}px;max-width:102px;top:50%;transform:translate3d(0,-50%,0);display:flex;flex-direction:column;align-items:flex-end;gap:.12rem;
    padding:.5rem .6rem;border-radius:10px;border:1px solid ${T.line};
    background:color-mix(in srgb, ${T.surface} 72%, transparent);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);
    font-family:${FONT.mono};line-height:1.1;transition:opacity .35s ease}
  .hud-tel.back{opacity:.18}
  .hud-stripes{display:flex;gap:2px;margin-bottom:.18rem}
  .hud-stripes i{display:block;width:10px;height:3px;transform:skewX(-12deg)}
  .hud-stripes i:nth-child(1){background:#0066B1}
  .hud-stripes i:nth-child(2){background:#003399}
  .hud-stripes i:nth-child(3){background:#E30613}
  .hud-cap{font-size:.52rem;letter-spacing:.18em;color:${T.muted}}
  .hud-gear-row{display:flex;align-items:baseline;gap:.35rem}
  .hud-gear{font-size:1.35rem;font-weight:800;color:#d97706;text-shadow:0 0 10px rgba(251,191,36,.45)}
  .hud-speed-row{display:flex;align-items:baseline;gap:.25rem;margin-top:.1rem}
  .hud-kmh{font-size:1rem;font-weight:700;color:${T.ink};font-variant-numeric:tabular-nums;letter-spacing:-.01em}
  .hud-unit{font-size:.5rem;letter-spacing:.12em;color:${T.blue}}
  .hud-rev{font-size:.5rem;letter-spacing:.14em;color:${T.muted};font-variant-numeric:tabular-nums}
  .hud-red{color:#E30613;font-weight:600}

  :root[data-theme="dark"] .hud-gear{color:#fbbf24}

  /* it must never crowd the text: the readout goes first, then the gauge */
  @media (max-width:1340px){.hud-tel{display:none}}
  @media (max-width:900px){.hud{display:none}}
  @media (prefers-reduced-motion:reduce){.hud-fill{transition:none}}
`;
