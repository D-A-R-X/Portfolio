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
