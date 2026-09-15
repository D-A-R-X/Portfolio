/* ─────────────────────────────────────────────────────────
   Design system — technical editorial.
   Two typefaces, one signal colour, hairline rules, hard edges.
   Blue is a signal, not a mood: it marks state and emphasis,
   never fills space.
   ───────────────────────────────────────────────────────── */

export const T = {
  /* surfaces — near-black, faintly blue-cast */
  ink:     "#08090c",
  paper:   "#0b0d12",
  raise:   "#0e1117",
  raise2:  "#12161e",

  /* hairlines */
  line:    "#181c24",
  line2:   "#242a35",
  line3:   "#333a48",

  /* signal */
  blue:    "#2c64ff",
  blueLit: "#7ca0ff",
  blueDim: "#16306f",

  /* text */
  white:   "#edeef1",
  grey:    "#8c929e",
  greyDim: "#5c626e",
  faint:   "#343a46",
};

export const FONT = {
  /* Archivo — Swiss grotesk, set tight. Headings and body both. */
  sans: "'Archivo', 'Helvetica Neue', Arial, sans-serif",
  /* JetBrains Mono — labels, indices, metadata. */
  mono: "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",
};

export const blueA = (a) => `rgba(44,100,255,${a})`;
export const whiteA = (a) => `rgba(255,255,255,${a})`;

/* ─── GLASS ────────────────────────────────────────────────
   Frosted surfaces. The look comes from four things stacked:
   a translucent gradient body, a real backdrop blur, a hairline
   border, and a 1px inner top highlight that reads as the lit
   edge of a pane. Never a flat rgba fill.
   ───────────────────────────────────────────────────────── */
export const GLASS = {
  panel: {
    background: "linear-gradient(158deg, rgba(26,33,48,0.62) 0%, rgba(11,15,23,0.48) 100%)",
    backdropFilter: "blur(20px) saturate(165%)",
    WebkitBackdropFilter: "blur(20px) saturate(165%)",
    border: "1px solid rgba(255,255,255,0.075)",
    boxShadow: "0 30px 70px -44px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.07)",
  },
  panelLit: {
    background: "linear-gradient(158deg, rgba(34,44,64,0.72) 0%, rgba(14,19,29,0.56) 100%)",
    backdropFilter: "blur(24px) saturate(185%)",
    WebkitBackdropFilter: "blur(24px) saturate(185%)",
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "0 40px 90px -46px rgba(0,0,0,1), 0 0 0 1px rgba(44,100,255,0.10), inset 0 1px 0 rgba(255,255,255,0.13)",
  },
  bar: {
    background: "rgba(8,10,15,0.55)",
    backdropFilter: "blur(26px) saturate(180%)",
    WebkitBackdropFilter: "blur(26px) saturate(180%)",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },
  chip: {
    background: "rgba(255,255,255,0.035)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.07)",
  },
};

/* Easing used across the whole page so motion feels like one system. */
export const EASE = {
  out:    "cubic-bezier(0.16, 1, 0.3, 1)",
  inOut:  "cubic-bezier(0.65, 0, 0.35, 1)",
  spring: "cubic-bezier(0.34, 1.4, 0.64, 1)",
};

/* Shared type ramps — used instead of ad-hoc sizes per component. */
export const TYPE = {
  /* oversized display, set tight and flush */
  display: (mobile) => ({
    fontFamily: FONT.sans,
    fontWeight: 700,
    fontSize: mobile ? "clamp(2.6rem,13vw,4.4rem)" : "clamp(3.2rem,6.6vw,6.4rem)",
    lineHeight: 0.88,
    letterSpacing: "-0.042em",
    color: T.white,
  }),
  h2: (mobile) => ({
    fontFamily: FONT.sans,
    fontWeight: 600,
    fontSize: mobile ? "1.55rem" : "2.1rem",
    lineHeight: 1.08,
    letterSpacing: "-0.028em",
    color: T.white,
  }),
  h3: (mobile) => ({
    fontFamily: FONT.sans,
    fontWeight: 600,
    fontSize: mobile ? "1.02rem" : "1.18rem",
    lineHeight: 1.2,
    letterSpacing: "-0.018em",
    color: T.white,
  }),
  body: {
    fontFamily: FONT.sans,
    fontWeight: 400,
    fontSize: "0.895rem",
    lineHeight: 1.68,
    letterSpacing: "-0.005em",
    color: T.grey,
  },
  /* mono label — uppercase, wide-tracked, small */
  label: {
    fontFamily: FONT.mono,
    fontWeight: 500,
    fontSize: "0.63rem",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  },
  meta: {
    fontFamily: FONT.mono,
    fontWeight: 400,
    fontSize: "0.68rem",
    letterSpacing: "0.02em",
    color: T.greyDim,
  },
};
