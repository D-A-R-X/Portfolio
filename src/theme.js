/* ─────────────────────────────────────────────────────────
   Design system — one palette, two themes.

   Every token is a CSS custom property, so `T.ink` is the string
   "var(--ink)". Inline styles, the global CSS and the SVG mockups
   all read the same variables, which means flipping
   `document.documentElement.dataset.theme` re-themes the whole
   page without React re-rendering anything.

   Canvas and WebGL cannot read CSS variables, so the same palette
   is also exported as real numbers in RAW, keyed by theme.
   ───────────────────────────────────────────────────────── */

const LIGHT = {
  bg:       "#f7faff",
  surface:  "#ffffff",
  paper:    "#f7f8fb",
  tint:     "#eef2fb",
  wash:     "#e1e8f7",

  line:     "#e5e8ef",
  line2:    "#d4d9e3",
  line3:    "#b9c1cf",

  ink:      "#0c1322",
  text:     "#1d2433",
  body:     "#4b5565",
  muted:    "#6b7382",
  faint:    "#9aa1ae",

  blue:     "#1f4fd8",
  blueDeep: "#173da8",
  navy:     "#0f2256",
  sky:      "#4d7cf5",
  ice:      "#c3d2f7",

  /* the scene behind the particles: sky ramp, ranges, lake, petals */
  sky0:     "#c7d9ff",
  sky1:     "#dde8ff",
  sky2:     "#f1f6ff",
  sky3:     "#f7faff",
  far:      "#c6d5f5",
  rocks:    "#9fb7ea",
  near:     "#5d86e6",
  lake0:    "#d6e3fd",
  lake1:    "#eef4ff",
  petal:    "#9db8f2",
  glow:     "rgba(255,255,255,.95)",
  spark:    "#ffffff",
  /* the schematic mockups: the "paper" a device is drawn on */
  panel:    "#ffffff",
  panel2:   "#f3f6fd",
  cloud:    "rgba(255,255,255,.9)",
  cloud2:   "rgba(255,255,255,.5)",
};

/* Dark is not an inversion: the blues brighten so they still carry
   on a near-black ground, and the "navy" slot becomes the light end
   of the ramp because it is used for deep fills on light. */
const DARK = {
  bg:       "#070a12",
  surface:  "#0d1220",
  paper:    "#0f1524",
  tint:     "#141c30",
  wash:     "#1b2440",

  line:     "#1e2740",
  line2:    "#2a3650",
  line3:    "#3b4a6a",

  ink:      "#eef3ff",
  text:     "#dde5f7",
  body:     "#aab6d0",
  muted:    "#8591ad",
  faint:    "#5f6b86",

  blue:     "#5e8cff",
  blueDeep: "#3f6ef0",
  navy:     "#9db8ff",
  sky:      "#8fb0ff",
  ice:      "#1d2a4a",

  /* night: the same landscape after dark, lit by a cold moon */
  sky0:     "#05070f",
  sky1:     "#080d1c",
  sky2:     "#0b1225",
  sky3:     "#070a12",
  far:      "#121a33",
  rocks:    "#1a2442",
  near:     "#243461",
  lake0:    "#0d1530",
  lake1:    "#080d1e",
  petal:    "#3d5790",
  glow:     "rgba(150,180,255,.3)",
  spark:    "#cfe0ff",
  panel:    "#131b2e",
  panel2:   "#0f1728",
  cloud:    "rgba(125,155,230,.16)",
  cloud2:   "rgba(110,140,220,.07)",
};

export const RAW = { light: LIGHT, dark: DARK };

const hexToRgb = (h) => {
  const v = h.replace("#", "");
  const n = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16)).join(" ");
};

const vars = (p) => Object.entries(p)
  .map(([k, v]) => `--${k}:${v}`)
  .concat([`--ink-rgb:${hexToRgb(p.ink)}`, `--blue-rgb:${hexToRgb(p.blue)}`, `--bg-rgb:${hexToRgb(p.bg)}`])
  .join(";");

/* Both themes, plus the shadow ramp (softer and cooler on dark, where
   a black shadow does nothing and a lit edge reads better). */
export const THEME_CSS = `
  :root{${vars(LIGHT)};color-scheme:light;
    --shadow-card:0 1px 2px rgba(12,19,34,.04),0 8px 24px -16px rgba(15,34,86,.16);
    --shadow-lift:0 2px 4px rgba(12,19,34,.05),0 22px 44px -22px rgba(15,34,86,.26);
    --shadow-float:0 2px 6px rgba(12,19,34,.05),0 26px 50px -26px rgba(15,34,86,.3)}
  :root[data-theme="dark"]{${vars(DARK)};color-scheme:dark;
    --shadow-card:0 1px 2px rgba(0,0,0,.5),0 10px 30px -18px rgba(0,0,0,.8);
    --shadow-lift:0 2px 6px rgba(0,0,0,.55),0 26px 54px -24px rgba(0,0,0,.85);
    --shadow-float:0 3px 8px rgba(0,0,0,.6),0 30px 60px -26px rgba(0,0,0,.9)}
  :root{transition:background-color .5s ease}
`;

/* the tokens everything else uses */
export const T = Object.fromEntries(
  Object.keys(LIGHT).map((k) => [k, `var(--${k})`]),
);
/* kept for the handful of places that mean "the page behind this" */
T.white = T.surface;

export const FONT = {
  serif: "'Instrument Serif', 'Iowan Old Style', Georgia, serif",
  // tall, condensed stencil (Big Shoulders Stencil, self-hosted via Fontsource) — the name only
  name:  "'Big Shoulders Stencil Variable', 'Arial Narrow', sans-serif",
  // the headline voice: same family, solid — condensed caps that hold up on dark
  display: "'Big Shoulders Display Variable', 'Arial Narrow', sans-serif",
  sans:  "'Hanken Grotesk', 'Segoe UI', system-ui, sans-serif",
  mono:  "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",
};

export const blueA = (a) => `rgba(var(--blue-rgb) / ${a})`;
export const inkA = (a) => `rgba(var(--ink-rgb) / ${a})`;
export const bgA = (a) => `rgba(var(--bg-rgb) / ${a})`;

/* Quiet, layered shadows. Cards fade a pre-painted lift layer on hover
   rather than animating box-shadow, so hovering never repaints. */
export const SHADOW = {
  card:  "var(--shadow-card)",
  lift:  "var(--shadow-lift)",
  float: "var(--shadow-float)",
};

export const EASE = {
  out:    "cubic-bezier(0.16, 1, 0.3, 1)",
  inOut:  "cubic-bezier(0.65, 0, 0.35, 1)",
  spring: "cubic-bezier(0.34, 1.3, 0.64, 1)",
};

export const TYPE = {
  display: (mobile) => ({
    fontFamily: FONT.display,
    fontWeight: 600,
    fontSize: mobile ? "clamp(2.7rem,11.5vw,3.8rem)" : "clamp(3.4rem,6vw,6.1rem)",
    lineHeight: 1.0,
    letterSpacing: "-0.028em",
    color: T.ink,
    fontOpticalSizing: "auto",
  }),
  h2: (mobile) => ({
    fontFamily: FONT.display,
    fontWeight: 600,
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

/* Reads the live value of a token — for canvas, WebGL and anything
   else that needs a number rather than a var() reference. */
/* the particle ramp, as numbers — WebGL cannot read a CSS variable */
export const PARTICLE = {
  light: { deep: [0.09, 0.26, 0.80], mid: [0.20, 0.43, 0.96], lite: [0.60, 0.74, 1.0], hot: [1, 1, 1] },
  dark:  { deep: [0.24, 0.42, 0.95], mid: [0.44, 0.64, 1.0],  lite: [0.74, 0.86, 1.0], hot: [1, 1, 1] },
};

export const raw = (name, theme) => (RAW[theme] || RAW.light)[name];
