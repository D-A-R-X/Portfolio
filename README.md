# Surya J — Portfolio

Personal site for Surya J (DARX) — app & web developer at Kosal Tech Solutions,
building alongside Manju Global and AIVIDA.

**Live:** deployed on Vercel.

## Design

Technical-editorial: two typefaces (Archivo for display and body, JetBrains Mono
for labels and metadata), near-black surfaces, hairline rules, and a single
electric blue used as a signal rather than a fill. Depth comes from layered
planes and pointer-driven perspective — the nested hairline frames in the hero,
section backplanes that drift against the scroll, and a small rotation on cards.
All of it is disabled under `prefers-reduced-motion` and on touch widths.

## Stack

React 18 · Vite 5 · no CSS framework (inline styles off a shared token file).

| File | Purpose |
| --- | --- |
| `src/theme.js` | Colour tokens and the type ramp |
| `src/data.js` | All content — experience, projects, skills, certs |
| `src/parallax.jsx` | Depth primitives, scroll/pointer hooks, section furniture |
| `src/App.jsx` | Page composition |
| `src/assets.js` | Paths to the images in `public/img/` |

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
