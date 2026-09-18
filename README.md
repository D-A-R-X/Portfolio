# Surya J — Portfolio

Personal site for Surya J (DARX) — app & web developer at Kosal Tech Solutions,
with a contract engagement at Manju Global.

**Live:** deployed on Vercel.

## Design

A scroll-told story in the manner of emotion-agency.com, kept in white and
blue. Instrument Serif in condensed uppercase for display (with italic blue
lead-ins and a `↳` hook), Hanken Grotesk for reading, IBM Plex Mono for the
small captions that decode in letter by letter.

- **Loader** — a short counter that finishes on its own; no click gate
- **The world** — a sticky scene the first five chapters scroll over: an SVG
  landscape (sky, cloud banks, ranges, a lake with its reflection, grass,
  drifting petals) whose layers move at their own depths, and a WebGL
  particle cloud that morphs through five shapes as you read — an `S`
  monogram, a slab, a sphere, a torus and a `C` for Cruza
- **Scatter** — every particle has real physics: the pointer (or a finger)
  pushes, drags and swirls them; a spring pulls each one home and damping
  bleeds the energy off, so they overshoot slightly and settle. Mass varies
  per particle so a sweep sprays; disturbed particles glow with a white core
  and a blue halo
- **Smoke** — the cursor stirs a GPU fluid simulation (advection, vorticity,
  pressure solve) that billows in the page's blues and fades out; it sleeps
  three seconds after the pointer stops. Mouse only
- **What I do** — ten service rows; the one at the middle of the screen
  lights up and the rest fall back by distance
- **Experience** — expandable rows, the current role open
- **Projects** — filterable cards with schematic mockups; each opens a modal
  with the problem, the approach and the stack
- **Liquid cards** — hovering a project ripples its art around the cursor with
  RGB-split fringes while the card's edge bulges toward it; a fast scroll
  bends the cards and glitches them into shifted pixel bands
- **Credentials** — an awards-style list; certifications expand to show the
  certificate
- **Dock** — a bottom pill: menu, name (back to top) and an orb to contact.
  The menu is a full-screen overlay

On phones the particles sit higher, smaller and softer so the copy they pass
behind stays readable, and pointer parallax switches off. Everything respects
`prefers-reduced-motion` (the particles render one still frame).

### Performance

- one rAF loop drives every scroll effect, writing transforms onto the few
  elements that move — never CSS variables on the root — and sleeps when idle;
  measured at 0.1 ms median, 0.4 ms worst per frame while scrolling
- no `backdrop-filter`, CSS blur or blend modes
- the particles are one draw call of 9,000 points (4,200 on phones) with all
  five shapes uploaded once; the morph runs in the vertex shader. Paused
  off-screen and in hidden tabs, and recovers from a lost WebGL context
- reveals flip a class, so scrolling never re-renders React

- the smoke runs a 128-cell velocity grid and a 512 dye grid, about 0.2 ms
  a frame, and only while the pointer has moved in the last few seconds
- the card effect draws every animating card into one WebGL canvas that sits
  inside the projects grid (so it scrolls natively with the cards and never
  slips), about 0.2 ms per card; at rest the cards are plain DOM
- particle physics runs at a fixed 60 Hz on the CPU, touches only particles
  near the pointer or still moving, and stops entirely once they settle

Append `?perf` to the URL to expose `window.__particleBench(frames)`,
`window.__particleSweep(x0, y0, x1, y1, frames, settle)` and
`window.__smokeBench(frames)` and `window.__cardProbe[i](state)`.

## Stack

React 18 · Vite 5 · no CSS framework (inline styles off a shared token file).

| File | Purpose |
| --- | --- |
| `src/theme.js` | Colour tokens and the type ramp |
| `src/data.js` | All content — experience, projects, skills, certs |
| `src/motion.jsx` | Scroll engine, scrubbers, parallax, reveals, text decode |
| `src/world.jsx` | WebGL particle morph, pointer physics, the SVG landscape |
| `src/fluid.jsx` | The cursor smoke — a small stable-fluids solver |
| `src/cardfx.jsx` | Liquid / RGB-split / glitch shader for the project cards |
| `src/mockups.jsx` | Schematic project mockups |
| `src/App.jsx` | Page composition and global CSS |
| `src/assets.js` | Paths to the certificate images in `public/img/` |

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## Resume

`public/Surya_J_Resume.pdf` is generated, not hand-edited. Edit the content in
`tools/build_resume.py` and regenerate:

```bash
python tools/build_resume.py public/Surya_J_Resume.pdf
```

Needs `reportlab`. It embeds Franklin Gothic, Segoe UI and Consolas from
`C:/Windows/Fonts` — adjust `FONT_FILES` if you build elsewhere.
