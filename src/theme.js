/* ─────────────────────────────────────────────────────────
   Design system — white & blue.

   Instrument Serif (condensed uppercase, italic for blue lead-ins) for
   display, Hanken Grotesk for everything you read, IBM Plex Mono for
   small captions. Blue is spent on emphasis, links, the dock and the
   particle world.
   ───────────────────────────────────────────────────────── */

export const T = {
  /* surfaces */
  white:    "#ffffff",
  paper:    "#f7f8fb",
  tint:     "#eef2fb",
  wash:     "#e1e8f7",

  /* hairlines */
  line:     "#e5e8ef",
  line2:    "#d4d9e3",
  line3:    "#b9c1cf",

  /* ink */
  ink:      "#0c1322",
  text:     "#1d2433",
  body:     "#4b5565",
  muted:    "#6b7382",
  faint:    "#9aa1ae",

  /* blue */
  blue:     "#1f4fd8",
  blueDeep: "#173da8",
  navy:     "#0f2256",
  sky:      "#4d7cf5",
  ice:      "#c3d2f7",
};

export const FONT = {
  serif: "'Instrument Serif', 'Iowan Old Style', Georgia, serif",
  // tall, condensed stencil (Big Shoulders Stencil, self-hosted via Fontsource) — the name only
  name:  "'Big Shoulders Stencil Variable', 'Arial Narrow', sans-serif",
  sans:  "'Hanken Grotesk', 'Segoe UI', system-ui, sans-serif",
  mono:  "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
};

export const blueA = (a) => `rgba(31,79,216,${a})`;
export const inkA = (a) => `rgba(12,19,34,${a})`;

/* Quiet, layered shadows. Cards fade a pre-painted lift layer on hover
   rather than animating box-shadow, so hovering never repaints. */
export const SHADOW = {
  card:  "0 1px 2px rgba(12,19,34,0.04), 0 8px 24px -16px rgba(15,34,86,0.16)",
  lift:  "0 2px 4px rgba(12,19,34,0.05), 0 22px 44px -22px rgba(15,34,86,0.26)",
  float: "0 2px 6px rgba(12,19,34,0.05), 0 26px 50px -26px rgba(15,34,86,0.30)",
};

export const EASE = {
  out:    "cubic-bezier(0.16, 1, 0.3, 1)",
  inOut:  "cubic-bezier(0.65, 0, 0.35, 1)",
  spring: "cubic-bezier(0.34, 1.3, 0.64, 1)",
};

export const TYPE = {
  display: (mobile) => ({
    fontFamily: FONT.serif,
    fontWeight: 400,
    fontSize: mobile ? "clamp(2.7rem,11.5vw,3.8rem)" : "clamp(3.4rem,6vw,6.1rem)",
    lineHeight: 1.0,
    letterSpacing: "-0.028em",
    color: T.ink,
    fontOpticalSizing: "auto",
  }),
  h2: (mobile) => ({
    fontFamily: FONT.serif,
    fontWeight: 400,
    fontSize: mobile ? "2.15rem" : "clamp(2.5rem,4.2vw,3.6rem)",
    lineHeight: 1.06,
    letterSpacing: "-0.022em",
    color: T.ink,
    fontOpticalSizing: "auto",
  }),
  h3: (mobile) => ({
    fontFamily: FONT.sans,
    fontWeight: 600,
    fontSize: mobile ? "1.08rem" : "1.2rem",
    lineHeight: 1.3,
    letterSpacing: "-0.012em",
    color: T.ink,
  }),
  body: {
    fontFamily: FONT.sans,
    fontWeight: 400,
    fontSize: "1rem",
    lineHeight: 1.7,
    color: T.body,
  },
  label: {
    fontFamily: FONT.mono,
    fontWeight: 500,
    fontSize: "0.7rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  meta: {
    fontFamily: FONT.mono,
    fontWeight: 400,
    fontSize: "0.74rem",
    color: T.muted,
  },
};
