import { useMemo } from "react";
import { T, EASE, blueA, whiteA } from "./theme.js";

/* ─────────────────────────────────────────────────────────
   PROJECT MOCKUPS

   Schematic previews, not screenshots. Each project gets a device
   frame and an interior that reflects what the thing actually is —
   a dialpad for the dialer, a route for the tracking service, a
   node graph for the modular AI controller. Drawn in the same
   hairline-and-signal-blue language as the rest of the site, so
   fifteen of them read as one set.

   Everything shares a 200x140 canvas, so every slot in the layout
   is the same size regardless of whether the interior is a phone,
   a browser or a terminal.
   ───────────────────────────────────────────────────────── */

const LINE = whiteA(0.16);
const FAINT = whiteA(0.08);
const FILL = "rgba(255,255,255,0.03)";

/* ─── shared chrome ──────────────────────────────────────── */

function BrowserFrame({ children }) {
  return (
    <>
      <rect x="6" y="12" width="188" height="118" rx="3" fill={FILL} stroke={LINE} strokeWidth="1" />
      <rect x="6" y="12" width="188" height="13" rx="3" fill={whiteA(0.05)} stroke={LINE} strokeWidth="1" />
      {[13, 20, 27].map((cx) => (
        <circle key={cx} cx={cx} cy="18.5" r="1.6" fill={whiteA(0.22)} />
      ))}
      <rect x="36" y="15.5" width="70" height="6" rx="3" fill={whiteA(0.07)} />
      {children}
    </>
  );
}

function PhoneFrame({ children }) {
  return (
    <>
      <rect x="69" y="4" width="62" height="132" rx="8" fill={FILL} stroke={LINE} strokeWidth="1" />
      <rect x="90" y="7" width="20" height="3" rx="1.5" fill={whiteA(0.2)} />
      {children}
      <rect x="90" y="130" width="20" height="1.6" rx="0.8" fill={whiteA(0.22)} />
    </>
  );
}

function TerminalFrame({ children }) {
  return (
    <>
      <rect x="6" y="12" width="188" height="118" rx="3" fill="rgba(0,0,0,0.25)" stroke={LINE} strokeWidth="1" />
      <rect x="6" y="12" width="188" height="12" rx="3" fill={whiteA(0.05)} stroke={LINE} strokeWidth="1" />
      <rect x="12" y="16" width="42" height="4" rx="2" fill={whiteA(0.14)} />
      {children}
    </>
  );
}

/* ─── interiors ──────────────────────────────────────────── */

/** Mobile app: header, stat tiles, list rows. */
const phoneApp = (
  <PhoneFrame>
    <rect x="75" y="14" width="30" height="4" rx="2" fill={T.blueLit} />
    <rect x="75" y="21" width="20" height="3" rx="1.5" fill={whiteA(0.18)} />
    {[0, 1].map((i) => (
      <rect key={i} x={75 + i * 26} y="29" width="24" height="18" rx="2" fill={blueA(0.12)} stroke={blueA(0.4)} strokeWidth="0.7" />
    ))}
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x="75" y={53 + i * 15} width="50" height="11" rx="2" fill={whiteA(0.05)} stroke={FAINT} strokeWidth="0.6" />
        <circle cx="81" cy={58.5 + i * 15} r="2.6" fill={i === 0 ? T.blue : whiteA(0.18)} />
        <rect x="87" y={56 + i * 15} width={28 - i * 4} height="2.4" rx="1.2" fill={whiteA(0.22)} />
        <rect x="87" y={60 + i * 15} width={18} height="2" rx="1" fill={whiteA(0.1)} />
      </g>
    ))}
  </PhoneFrame>
);

/** Dialer: number readout over a 3x4 keypad. */
const phoneDialer = (
  <PhoneFrame>
    <rect x="77" y="16" width="46" height="10" rx="2" fill={blueA(0.1)} stroke={blueA(0.35)} strokeWidth="0.7" />
    <rect x="82" y="20" width="36" height="2.6" rx="1.3" fill={T.blueLit} />
    {Array.from({ length: 12 }, (_, i) => (
      <circle
        key={i}
        cx={82 + (i % 3) * 18}
        cy={37 + Math.floor(i / 3) * 17}
        r="6.4"
        fill={whiteA(0.04)}
        stroke={i === 10 ? blueA(0.55) : LINE}
        strokeWidth="0.7"
      />
    ))}
    <circle cx="100" cy="117" r="8" fill={T.blue} />
    <rect x="96.5" y="113.5" width="7" height="7" rx="1.6" fill={whiteA(0.85)} />
    {/* recording indicator */}
    <circle cx="118" cy="30" r="2.2" fill={T.blueLit} />
  </PhoneFrame>
);

/** Companion app: a character blob with reaction rings. */
const phoneCompanion = (
  <PhoneFrame>
    <circle cx="100" cy="52" r="24" fill="none" stroke={blueA(0.18)} strokeWidth="0.7" strokeDasharray="2 3" />
    <circle cx="100" cy="52" r="17" fill={blueA(0.14)} stroke={blueA(0.5)} strokeWidth="1" />
    <circle cx="94" cy="49" r="2" fill={T.white} />
    <circle cx="106" cy="49" r="2" fill={T.white} />
    <path d="M94 57 Q100 62 106 57" fill="none" stroke={T.white} strokeWidth="1.2" strokeLinecap="round" />
    <rect x="76" y="84" width="48" height="14" rx="7" fill={whiteA(0.05)} stroke={FAINT} strokeWidth="0.6" />
    <rect x="82" y="88" width="30" height="2.4" rx="1.2" fill={whiteA(0.28)} />
    <rect x="82" y="93" width="20" height="2" rx="1" fill={whiteA(0.13)} />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={77 + i * 16} y="106" width="13" height="13" rx="2" fill={whiteA(0.05)} stroke={FAINT} strokeWidth="0.6" />
    ))}
  </PhoneFrame>
);

/** Resource grid: tiles of course material. */
const phoneGrid = (
  <PhoneFrame>
    <rect x="75" y="14" width="34" height="4" rx="2" fill={T.blueLit} />
    <rect x="75" y="23" width="50" height="8" rx="2" fill={whiteA(0.05)} stroke={FAINT} strokeWidth="0.6" />
    {Array.from({ length: 6 }, (_, i) => (
      <g key={i}>
        <rect
          x={75 + (i % 2) * 26} y={37 + Math.floor(i / 2) * 25} width="24" height="21" rx="2"
          fill={i === 0 ? blueA(0.12) : whiteA(0.04)} stroke={i === 0 ? blueA(0.4) : FAINT} strokeWidth="0.7"
        />
        <rect x={79 + (i % 2) * 26} y={41 + Math.floor(i / 2) * 25} width="10" height="2" rx="1" fill={whiteA(0.25)} />
        <rect x={79 + (i % 2) * 26} y={45 + Math.floor(i / 2) * 25} width="14" height="1.8" rx="0.9" fill={whiteA(0.12)} />
      </g>
    ))}
  </PhoneFrame>
);

/** Progress rings + bars. */
const phoneProgress = (
  <PhoneFrame>
    <circle cx="100" cy="46" r="20" fill="none" stroke={whiteA(0.1)} strokeWidth="4" />
    <circle
      cx="100" cy="46" r="20" fill="none" stroke={T.blue} strokeWidth="4" strokeLinecap="round"
      strokeDasharray="126" strokeDashoffset="42" transform="rotate(-90 100 46)"
    />
    <rect x="92" y="43" width="16" height="3.4" rx="1.7" fill={T.white} />
    {[34, 22, 40, 16].map((w, i) => (
      <g key={i}>
        <rect x="76" y={80 + i * 13} width="48" height="6" rx="3" fill={whiteA(0.06)} />
        <rect x="76" y={80 + i * 13} width={w} height="6" rx="3" fill={i === 0 ? T.blueLit : blueA(0.45)} />
      </g>
    ))}
  </PhoneFrame>
);

/** Dash-cam: viewfinder over an event timeline. */
const phoneTimeline = (
  <PhoneFrame>
    <rect x="75" y="14" width="50" height="34" rx="2" fill={whiteA(0.06)} stroke={FAINT} strokeWidth="0.7" />
    <path d="M79 44 L92 26 L108 26 L121 44" fill="none" stroke={blueA(0.45)} strokeWidth="0.8" />
    <circle cx="119" cy="18" r="2.2" fill={T.blueLit} />
    <rect x="75" y="54" width="50" height="1" fill={whiteA(0.14)} />
    {[8, 20, 33, 44].map((x, i) => (
      <g key={i}>
        <rect x={75 + x} y={50} width="1.4" height="9" fill={i === 1 ? T.blue : whiteA(0.3)} />
        {i === 1 && <circle cx={75.7 + x} cy="47" r="2" fill={T.blue} />}
      </g>
    ))}
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x="75" y={66 + i * 16} width="50" height="12" rx="2" fill={whiteA(0.04)} stroke={FAINT} strokeWidth="0.6" />
        <rect x="79" y={69 + i * 16} width="3" height="6" rx="1.5" fill={i === 0 ? T.blue : whiteA(0.2)} />
        <rect x="86" y={70 + i * 16} width={26 - i * 5} height="2.2" rx="1.1" fill={whiteA(0.2)} />
      </g>
    ))}
  </PhoneFrame>
);

/** ERP dashboard: sidebar, KPI row, chart, table. */
const dashboard = (
  <BrowserFrame>
    <rect x="6" y="25" width="38" height="105" fill={whiteA(0.03)} />
    <line x1="44" y1="25" x2="44" y2="130" stroke={LINE} strokeWidth="0.8" />
    {Array.from({ length: 7 }, (_, i) => (
      <rect key={i} x="11" y={32 + i * 11} width={i === 1 ? 26 : 20} height="3.4" rx="1.7" fill={i === 1 ? T.blueLit : whiteA(0.14)} />
    ))}
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={51 + i * 46} y="31" width="40" height="22" rx="2" fill={whiteA(0.04)} stroke={FAINT} strokeWidth="0.6" />
        <rect x={55 + i * 46} y="36" width="14" height="2.4" rx="1.2" fill={whiteA(0.18)} />
        <rect x={55 + i * 46} y="42" width="22" height="5" rx="1.5" fill={i === 0 ? T.blueLit : whiteA(0.28)} />
      </g>
    ))}
    <rect x="51" y="59" width="86" height="40" rx="2" fill={whiteA(0.03)} stroke={FAINT} strokeWidth="0.6" />
    <polyline points="55,92 66,82 77,86 88,71 99,76 110,64 121,68 132,58" fill="none" stroke={T.blue} strokeWidth="1.2" strokeLinejoin="round" />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x="143" y={59 + i * 8.4} width={34 - i * 4} height="5" rx="1.5" fill={i === 0 ? blueA(0.5) : whiteA(0.1)} />
    ))}
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x="51" y={105 + i * 8.5} width="126" height="6.4" rx="1.5" fill={whiteA(0.035)} />
        <rect x="55" y={107 + i * 8.5} width="24" height="2.4" rx="1.2" fill={whiteA(0.2)} />
        <rect x="88" y={107 + i * 8.5} width="34" height="2.4" rx="1.2" fill={whiteA(0.11)} />
        <rect x="150" y={106.5 + i * 8.5} width="18" height="3.4" rx="1.7" fill={i === 0 ? blueA(0.45) : whiteA(0.1)} />
      </g>
    ))}
  </BrowserFrame>
);

/** Ops board: rows with status pills and an evidence thumb. */
const opsBoard = (
  <BrowserFrame>
    <rect x="14" y="32" width="46" height="4" rx="2" fill={T.blueLit} />
    {["", "", ""].map((_, i) => (
      <rect key={i} x={112 + i * 26} y="31" width="22" height="6" rx="3" fill={i === 0 ? blueA(0.4) : whiteA(0.08)} />
    ))}
    {Array.from({ length: 5 }, (_, i) => (
      <g key={i}>
        <rect x="14" y={45 + i * 16} width="166" height="13" rx="2" fill={whiteA(0.035)} stroke={FAINT} strokeWidth="0.55" />
        <rect x="19" y={48 + i * 16} width="10" height="7" rx="1.5" fill={whiteA(0.09)} />
        <rect x="34" y={49 + i * 16} width={40 - i * 3} height="2.6" rx="1.3" fill={whiteA(0.22)} />
        <rect x="34" y={53.5 + i * 16} width={26} height="2" rx="1" fill={whiteA(0.1)} />
        <rect x="112" y={49.5 + i * 16} width="26" height="4.4" rx="2.2" fill={i < 2 ? blueA(0.45) : whiteA(0.1)} />
        <circle cx="168" cy={51.5 + i * 16} r="3" fill="none" stroke={i < 2 ? blueA(0.6) : whiteA(0.18)} strokeWidth="0.9" />
      </g>
    ))}
  </BrowserFrame>
);

/** Landing page: hero, columns, form. */
const landing = (
  <BrowserFrame>
    <rect x="14" y="32" width="60" height="7" rx="2" fill={whiteA(0.28)} />
    <rect x="14" y="43" width="90" height="4" rx="2" fill={whiteA(0.13)} />
    <rect x="14" y="50" width="70" height="4" rx="2" fill={whiteA(0.1)} />
    <rect x="14" y="61" width="34" height="9" rx="2" fill={T.blue} />
    <rect x="52" y="61" width="30" height="9" rx="2" fill={whiteA(0.06)} stroke={FAINT} strokeWidth="0.6" />
    <rect x="120" y="32" width="60" height="42" rx="2" fill={blueA(0.1)} stroke={blueA(0.34)} strokeWidth="0.7" />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={14 + i * 57} y="84" width="52" height="34" rx="2" fill={whiteA(0.035)} stroke={FAINT} strokeWidth="0.55" />
        <rect x={19 + i * 57} y="89" width="12" height="12" rx="2" fill={i === 0 ? blueA(0.4) : whiteA(0.1)} />
        <rect x={19 + i * 57} y="105" width="34" height="2.4" rx="1.2" fill={whiteA(0.2)} />
        <rect x={19 + i * 57} y="110" width="24" height="2" rx="1" fill={whiteA(0.1)} />
      </g>
    ))}
  </BrowserFrame>
);

/** Menu site: hero band and priced list. */
const menuSite = (
  <BrowserFrame>
    <rect x="6" y="25" width="188" height="36" fill={blueA(0.08)} />
    <rect x="16" y="35" width="56" height="8" rx="2" fill={whiteA(0.3)} />
    <rect x="16" y="47" width="38" height="3.4" rx="1.7" fill={whiteA(0.15)} />
    {Array.from({ length: 5 }, (_, i) => (
      <g key={i}>
        <rect x="16" y={70 + i * 11} width={52 - (i % 3) * 8} height="3" rx="1.5" fill={whiteA(0.24)} />
        <rect x="16" y={75 + i * 11} width={36 - (i % 2) * 8} height="2.2" rx="1.1" fill={whiteA(0.1)} />
        <rect x="170" y={70 + i * 11} width="14" height="3" rx="1.5" fill={i === 0 ? T.blueLit : whiteA(0.18)} />
      </g>
    ))}
    <rect x="120" y="68" width="42" height="44" rx="2" fill={whiteA(0.05)} stroke={FAINT} strokeWidth="0.6" />
  </BrowserFrame>
);

/** Live map: route, pins, accuracy halo. */
const mapView = () => (
  <BrowserFrame>
    <rect x="6" y="25" width="188" height="105" fill="rgba(10,16,30,0.5)" />
    {Array.from({ length: 7 }, (_, i) => (
      <line key={`v${i}`} x1={6 + i * 27} y1="25" x2={6 + i * 27} y2="130" stroke={whiteA(0.05)} strokeWidth="0.6" />
    ))}
    {Array.from({ length: 4 }, (_, i) => (
      <line key={`h${i}`} x1="6" y1={45 + i * 24} x2="194" y2={45 + i * 24} stroke={whiteA(0.05)} strokeWidth="0.6" />
    ))}
    <path d="M26 116 L52 96 L70 100 L96 70 L124 76 L150 46 L176 52" fill="none" stroke={T.blue} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    <circle cx="26" cy="116" r="3" fill={whiteA(0.5)} />
    <circle cx="176" cy="52" r="10" fill={blueA(0.14)} />
    <circle cx="176" cy="52" r="4" fill={T.blueLit} />
    {[[70, 100], [124, 76]].map(([cx, cy], i) => (
      <rect key={i} x={cx - 2.4} y={cy - 2.4} width="4.8" height="4.8" fill={whiteA(0.55)} transform={`rotate(45 ${cx} ${cy})`} />
    ))}
    <rect x="12" y="31" width="52" height="16" rx="2" fill="rgba(8,10,15,0.75)" stroke={FAINT} strokeWidth="0.6" />
    <circle cx="19" cy="39" r="2" fill={T.blueLit} />
    <rect x="25" y="35" width="32" height="2.4" rx="1.2" fill={whiteA(0.28)} />
    <rect x="25" y="40" width="22" height="2" rx="1" fill={whiteA(0.12)} />
  </BrowserFrame>
);

/** Signal chart: candles, entry markers, verdict rail. */
const chartView = (
  <BrowserFrame>
    <rect x="6" y="25" width="188" height="105" fill="rgba(8,12,22,0.4)" />
    {Array.from({ length: 4 }, (_, i) => (
      <line key={i} x1="14" y1={40 + i * 22} x2="152" y2={40 + i * 22} stroke={whiteA(0.05)} strokeWidth="0.6" />
    ))}
    {Array.from({ length: 14 }, (_, i) => {
      const h = 10 + ((i * 37) % 30);
      const y = 46 + ((i * 23) % 40);
      const up = i % 3 !== 1;
      return (
        <g key={i}>
          <line x1={20 + i * 9.6} y1={y - 5} x2={20 + i * 9.6} y2={y + h + 5} stroke={up ? blueA(0.5) : whiteA(0.2)} strokeWidth="0.7" />
          <rect x={17.6 + i * 9.6} y={y} width="4.8" height={h} fill={up ? T.blue : whiteA(0.25)} />
        </g>
      );
    })}
    <polyline points="20,96 40,88 60,92 80,74 100,80 120,66 140,72" fill="none" stroke={T.blueLit} strokeWidth="0.9" strokeDasharray="3 2" />
    {[[60, 92], [120, 66]].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="3.2" fill="none" stroke={T.blueLit} strokeWidth="1.1" />
    ))}
    {Array.from({ length: 5 }, (_, i) => (
      <rect key={i} x="160" y={34 + i * 12} width="26" height="7" rx="1.5" fill={i % 2 ? whiteA(0.08) : blueA(0.4)} />
    ))}
  </BrowserFrame>
);

/** Module graph: a reasoning core delegating to satellites. */
const nodeGraph = (
  <BrowserFrame>
    <circle cx="100" cy="76" r="30" fill="none" stroke={whiteA(0.07)} strokeWidth="0.7" strokeDasharray="3 4" />
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = 100 + Math.cos(a) * 44;
      const y = 76 + Math.sin(a) * 34;
      return (
        <g key={i}>
          <line x1="100" y1="76" x2={x} y2={y} stroke={blueA(0.28)} strokeWidth="0.8" />
          <rect x={x - 11} y={y - 6} width="22" height="12" rx="2" fill={whiteA(0.05)} stroke={i === 0 ? blueA(0.55) : LINE} strokeWidth="0.8" />
          <rect x={x - 7} y={y - 1.2} width="14" height="2.4" rx="1.2" fill={i === 0 ? T.blueLit : whiteA(0.22)} />
        </g>
      );
    })}
    <circle cx="100" cy="76" r="15" fill={blueA(0.16)} stroke={T.blue} strokeWidth="1.2" />
    <rect x="93" y="73" width="14" height="2.6" rx="1.3" fill={T.white} />
    <rect x="95" y="78" width="10" height="2.2" rx="1.1" fill={whiteA(0.5)} />
  </BrowserFrame>
);

/** Prediction panel: gauge plus ranked recommendations. */
const gaugeView = (
  <BrowserFrame>
    <path d="M30 96 A38 38 0 0 1 106 96" fill="none" stroke={whiteA(0.1)} strokeWidth="7" strokeLinecap="round" />
    <path d="M30 96 A38 38 0 0 1 88 65" fill="none" stroke={T.blue} strokeWidth="7" strokeLinecap="round" />
    <rect x="56" y="80" width="24" height="5" rx="2.5" fill={T.white} />
    <rect x="60" y="89" width="16" height="2.6" rx="1.3" fill={whiteA(0.2)} />
    {Array.from({ length: 4 }, (_, i) => (
      <g key={i}>
        <rect x="120" y={36 + i * 17} width="60" height="13" rx="2" fill={whiteA(0.04)} stroke={FAINT} strokeWidth="0.55" />
        <rect x="124" y={39 + i * 17} width="4" height="7" rx="1" fill={i === 0 ? T.blueLit : whiteA(0.16)} />
        <rect x="132" y={40 + i * 17} width={34 - i * 5} height="2.4" rx="1.2" fill={whiteA(0.2)} />
        <rect x="132" y={44.5 + i * 17} width="22" height="2" rx="1" fill={whiteA(0.09)} />
      </g>
    ))}
    <rect x="22" y="112" width="92" height="3" rx="1.5" fill={whiteA(0.09)} />
    <rect x="22" y="112" width="58" height="3" rx="1.5" fill={blueA(0.55)} />
  </BrowserFrame>
);

/** Terminal: a CLI run with structured output. */
const terminal = (
  <TerminalFrame>
    {Array.from({ length: 9 }, (_, i) => {
      const isCmd = i === 0 || i === 5;
      return (
        <g key={i}>
          {isCmd && <rect x="13" y={32 + i * 10} width="4" height="3" rx="1" fill={T.blueLit} />}
          <rect
            x={isCmd ? 21 : 19} y={32 + i * 10}
            width={isCmd ? 92 : 40 + ((i * 29) % 110)} height="3" rx="1.5"
            fill={isCmd ? T.blueLit : whiteA(0.13)}
          />
        </g>
      );
    })}
    <rect x="19" y="122" width="5" height="4" fill={T.blue} />
  </TerminalFrame>
);

const KINDS = {
  "phone-app": phoneApp,
  "phone-dialer": phoneDialer,
  "phone-companion": phoneCompanion,
  "phone-grid": phoneGrid,
  "phone-progress": phoneProgress,
  "phone-timeline": phoneTimeline,
  dashboard,
  "ops-board": opsBoard,
  landing,
  "menu-site": menuSite,
  map: mapView(),
  chart: chartView,
  graph: nodeGraph,
  gauge: gaugeView,
  terminal,
};

/**
 * Renders a project's schematic. `draw` gates the paint-on animation so an
 * expanding panel can play it; the wrapper stays mounted either way.
 */
export function Mockup({ kind, width = 200, draw = true, style = {} }) {
  const art = KINDS[kind] || KINDS.dashboard;

  return (
    <div
      style={{
        width, maxWidth: "100%", aspectRatio: "200 / 140",
        opacity: draw ? 1 : 0,
        transform: draw ? "scale(1)" : "scale(0.97)",
        transition: `opacity 0.6s ${EASE.out} 0.1s, transform 0.8s ${EASE.out} 0.1s`,
        ...style,
      }}
    >
      <svg viewBox="0 0 200 140" width="100%" height="100%" aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
        {/* ruled ground so the frame sits on something */}
        <defs>
          <pattern id="mockGrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M10 0 L0 0 0 10" fill="none" stroke={whiteA(0.035)} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="200" height="140" fill="url(#mockGrid)" />
        {/* corner ticks */}
        {[[2, 2, 1, 1], [198, 2, -1, 1], [2, 138, 1, -1], [198, 138, -1, -1]].map(([x, y, dx, dy], i) => (
          <g key={i} stroke={blueA(0.5)} strokeWidth="0.9">
            <line x1={x} y1={y} x2={x + dx * 7} y2={y} />
            <line x1={x} y1={y} x2={x} y2={y + dy * 7} />
          </g>
        ))}
        {art}
      </svg>
    </div>
  );
}

export const MOCKUP_KINDS = Object.keys(KINDS);
