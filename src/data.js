/* ─── CONTENT ────────────────────────────── */

export const NAV_LINKS = ["About", "Experience", "Stack", "Work", "Cruza", "Contact"];

export const CONTACT_LINKS = [
  { label: "Email",    value: "surya777dbs@gmail.com", href: "mailto:surya777dbs@gmail.com" },
  { label: "GitHub",   value: "github.com/D-A-R-X",    href: "https://github.com/D-A-R-X" },
  { label: "LinkedIn", value: "Surya J",               href: "https://www.linkedin.com/in/surya-j-194910306" },
  { label: "WhatsApp", value: "Message me",            href: "https://wa.me/qr/U4KOUOEM4BFXA1" },
];

/* ─── EXPERIENCE ─────────────────────────── */
export const EXPERIENCE = [
  {
    company: "Kosal Tech Solutions",
    role: "Software Developer",
    period: "Present",
    current: true,
    sector: "Software Services",
    about:
      "Software services company. I work across internal tooling and client-facing web builds — taking work from brief through to something running in production.",
    summary:
      "Building internal tooling and client-facing web systems, from CLI tooling to full landing-page delivery.",
    highlights: [
      "Kosal-Link — a four-tool scraper suite in a CLI + backend monorepo: a static downloader, a browser-based scraper for JS-heavy pages, a structure extractor, and a CLI that renders a live page, detects section boundaries and exports selector-scoped components as a reusable blueprint.",
      "Client landing pages and marketing sites, built and shipped end to end.",
    ],
    stack: ["Python", "Node.js", "Convex", "CLI Tooling", "Web"],
  },
  {
    company: "Manju Global",
    role: "App & Web Developer",
    period: "Contract",
    current: true,
    contract: true,
    sector: "Real Estate Development",
    about:
      "Manju Groups develops and sells residential land and plots. Their internal platform coordinates project, marketing, telecaller, finance, HR and operations work across the whole business — so the engineering surface runs from Android in the field to geospatial services on the backend.",
    summary:
      "Contract engagement across the Manju Groups product surface — the Android client, the operations platform, and the services behind them.",
    highlights: [
      "Mconnect — the Android client: OTP authentication, HR, attendance, leave and chat. Kotlin + MVVM + Retrofit, AES256-GCM encrypted session storage, and a semantic colour-token design system driving light and dark from one source.",
      "The operations platform — a Next.js + Convex ERP spanning land procurement, CRM and site visits, channel-partner management, marketing budgets with campaign spend approval, finance ledgers and outstanding reports, HR and attendance, fleet and complaints.",
      "Airix Geo Tracking — a dedicated Go service for location ingestion, live tracking, trip sessions and tamper monitoring on PostgreSQL/PostGIS + TimescaleDB, with Redis for live state and idempotency.",
      "Travel Desk — trip allocation and fleet billing, with token-scoped driver pages delivered over WhatsApp and OCR on uploaded odometer evidence.",
    ],
    stack: ["Kotlin", "Next.js", "React", "Convex", "Go", "PostGIS", "TypeScript"],
  },
  {
    company: "VEI Technologies",
    role: "MERN Stack Developer Intern",
    period: "Jan 2025 – Feb 2025",
    current: false,
    sector: "Internship",
    about: "A 30-day full-stack development internship.",
    summary:
      "Built full-stack modules on MongoDB, Express, React and Node, integrating REST APIs between frontend components and backend services across agile sprints.",
    highlights: [
      "Developed full-stack modules using MongoDB, Express.js, React and Node.js.",
      "Built and integrated REST APIs connecting frontend components with backend services.",
      "Contributed to agile sprints, shipping scalable web features on schedule.",
    ],
    stack: ["MongoDB", "Express", "React", "Node.js"],
  },
  {
    company: "NoviTech",
    role: "Web Development Intern",
    period: "Jan 2025",
    current: false,
    sector: "Internship",
    about: "A 15-day intensive web development program.",
    summary:
      "Designed responsive web interfaces and wired them to backend services, optimising page performance across multiple modules.",
    highlights: [
      "Designed and implemented responsive interfaces in HTML, CSS and JavaScript.",
      "Integrated backend services and optimised page performance across modules.",
    ],
    stack: ["HTML", "CSS", "JavaScript"],
  },
];

/* ─── SKILLS ─────────────────────────────── */
export const SKILL_BARS = [
  { name: "Python",             level: 87, cat: "Languages"  },
  { name: "JavaScript / TS",    level: 78, cat: "Languages"  },
  { name: "Kotlin",             level: 72, cat: "Languages"  },
  { name: "Dart",               level: 62, cat: "Languages"  },
  { name: "Go",                 level: 55, cat: "Languages"  },
  { name: "React · Next.js",    level: 82, cat: "Frameworks" },
  { name: "FastAPI",            level: 70, cat: "Frameworks" },
  { name: "Jetpack Compose",    level: 74, cat: "Frameworks" },
  { name: "Flutter",            level: 60, cat: "Frameworks" },
  { name: "Convex · Firebase",  level: 76, cat: "Backend"    },
  { name: "REST APIs",          level: 74, cat: "Backend"    },
  { name: "PostgreSQL · SQLite",level: 66, cat: "Data"       },
  { name: "Prompt Engineering", level: 96, cat: "AI / GenAI" },
  { name: "Generative AI",      level: 90, cat: "AI / GenAI" },
  { name: "Machine Learning",   level: 62, cat: "AI / GenAI" },
  { name: "Vercel · Render",    level: 80, cat: "Deployment" },
  { name: "Vibe Coding",        level: 97, cat: "Approach"   },
  { name: "Creativity",         level: 90, cat: "Skill"      },
];

/* ─── PROJECTS ───────────────────────────── */
export const PROJECT_FILTERS = ["All", "Professional", "AI Systems", "Products", "Mobile"];

export const PROJECTS = [
  {
    id: "01", name: "Mconnect", tag: "Manju Groups PMS · Android", cat: "Professional", mock: "phone-app",
    problem: "Field and office staff were spread across disconnected tools — attendance, leave, HR records and team chat each lived somewhere else, so nothing reconciled.",
    stack: ["Kotlin", "MVVM", "Retrofit", "Coroutines", "EncryptedSharedPreferences"],
    power: "A single Android client for the Manju Groups project-management system: OTP authentication, HR, attendance, leave and chat in one app.",
    highlight: "Semantic colour-token design system so every screen themes light/dark from one source. AES256-GCM encrypted local storage for session and credentials.",
    repo: null, repoLabel: "Company Project", org: "Manju Global",
  },
  {
    id: "02", name: "Airix Geo Tracking", tag: "Live Location & Trip Service", cat: "Professional", mock: "map",
    problem: "Location ingestion was welded into the main application, so tracking load could not scale independently and every tamper or trip feature meant touching the monolith.",
    stack: ["Go", "PostgreSQL", "PostGIS", "TimescaleDB", "Redis", "Docker"],
    power: "A dedicated Go service for location ingestion, live tracking, trip sessions and tamper monitoring — scalable apart from the platform it serves.",
    highlight: "HTTP API plus independently scaled workers. PostGIS + TimescaleDB as system of record, Redis for live state, idempotency and event fan-out. Compatibility adapters keep the existing tracking contracts intact.",
    repo: null, repoLabel: "Company Project", org: "Manju Global",
  },
  {
    id: "03", name: "Manju PMS Platform", tag: "Land & Project Operations", cat: "Professional", mock: "dashboard",
    problem: "Land procurement, legal clearance, feasibility and channel-partner workflows ran on spreadsheets and messages — no shared state, no audit trail, no way to see where a deal actually stood.",
    stack: ["Next.js", "TypeScript", "Convex", "Tailwind", "Recharts", "AI SDK"],
    power: "A full operations platform covering land procurement, legal and feasibility gates, channel-partner management, reporting and an AI sales assistant.",
    highlight: "Mandatory-field gating per workflow stage so records cannot advance half-complete. Real-time Convex backend, generated Excel/PDF reporting, push notifications and guided in-app tours.",
    repo: null, repoLabel: "Company Project", org: "Manju Global",
  },
  {
    id: "04", name: "Travel Desk", tag: "Trip Allocation & Fleet Billing", cat: "Professional", mock: "ops-board",
    problem: "Trip requests, driver assignment and billing were coordinated over phone calls — extra kilometres, cancellations and on-site delays were argued after the fact with no evidence.",
    stack: ["Next.js 16", "React 19", "TypeScript", "Tesseract.js", "Tailwind"],
    power: "End-to-end trip desk: request, allocate, dispatch to the driver, track each status transition, and finalise billing against what actually happened.",
    highlight: "Token-scoped driver pages sent over WhatsApp — no driver login needed. OCR on uploaded odometer and document evidence. Explicit states for extra-km, cancellation billing and offline completion.",
    repo: null, repoLabel: "Company Project", org: "Manju Global",
  },
  {
    id: "05", name: "Mentorix", tag: "AI Career Intelligence System", cat: "AI Systems", mock: "gauge",
    problem: "Students receive generic career advice that ignores behavioural patterns and decision history — static data fails to capture how a student actually evolves over time.",
    stack: ["Python", "FastAPI", "RandomForest", "SQLite", "HTML/CSS/JS"],
    power: "AI-driven engine that analyses student behaviour patterns to predict career instability and recommend personalised career paths.",
    highlight: "Modular REST APIs for career prediction and behavioural analytics. RandomForest ML with an explainable AI layer that returns reasoning, not just scores. Deployed on Render + Vercel.",
    repo: "https://github.com/D-A-R-X/mentorix-ai", repoLabel: "GitHub", org: "Cruza",
  },
  {
    id: "06", name: "Megatron", tag: "Modular Adaptive AI Control System", cat: "AI Systems", mock: "graph",
    problem: "Single-purpose AI systems are brittle — any new capability requires rewriting core logic, making them impossible to scale meaningfully.",
    stack: ["Python", "FastAPI", "HTML", "CSS", "JavaScript"],
    power: "Modular AI controller with a central reasoning layer that analyses intent and delegates to specialised modules.",
    highlight: "New capabilities added without touching core logic. Each module returns structured output independently — extensible by design.",
    repo: "https://github.com/D-A-R-X/Megatron", repoLabel: "GitHub",
  },
  {
    id: "07", name: "Darx Dialer", tag: "Default Phone App + Cloud Recording", cat: "Products", mock: "phone-dialer",
    problem: "Client and staff calls carry commitments nobody writes down. Stock dialers give you a call log and nothing else — no searchable record of what was actually agreed.",
    stack: ["Kotlin", "Jetpack Compose", "InCallService", "Convex", "Material 3"],
    power: "A full default-dialer replacement: outgoing and incoming calls, contacts, recents, and disclosed per-call recording synced to cloud storage.",
    highlight: "Implements InCallService and the DIALER role, so Android routes every call through it — lock-screen incoming UI, Bluetooth routing, DTMF, hold. Recording is consent-first: on-screen indicator, persistent notification, user-toggleable, never covert.",
    repo: null, repoLabel: "Private Build",
  },
  {
    id: "08", name: "Brownie Care", tag: "AI Companion Health App", cat: "Products", mock: "phone-companion",
    problem: "Health apps nag. They track numbers and push reminders, and people abandon them because nothing in the app actually feels like it cares whether you show up.",
    stack: ["Kotlin", "Compose Canvas", "Groq LLM", "Convex", "WorkManager", "DataStore"],
    power: "A personal health companion built around DARX — a character drawn entirely in Compose Canvas who reacts, talks and reminds, powered by llama-3.3-70b.",
    highlight: "No character assets: every frame of DARX is procedurally drawn with spring animations. DataStore is the source of truth with Convex as a best-effort cloud mirror, so the app works fully offline.",
    repo: null, repoLabel: "Private Build",
  },
  {
    id: "09", name: "Signal Tracker · SentinelX", tag: "Trading Signal Verification", cat: "Products", mock: "chart",
    problem: "Signal channels advertise near-perfect win rates by quietly never posting their losses. There is no way to judge one without independently recording every call they make.",
    stack: ["Python", "Telegram API", "Next.js", "Convex", "Pine Script", "SQLite"],
    power: "Listens to a signal channel, parses every call, and logs what would have happened — measuring true win rate without placing a single real trade.",
    highlight: "Deliberately paper-only by design. Companion SentinelX Pine Script strategies (scalper, intraday, fusion) for independent chart-side validation on TradingView.",
    repo: null, repoLabel: "Private Build",
  },
  {
    id: "10", name: "GenZ Reading Academy", tag: "Academy Site & Admissions Flow", cat: "Products", mock: "landing",
    problem: "Admissions ran on forms that produced nothing usable — enquiries arrived as raw text with no record, no document, and no reliable follow-up.",
    stack: ["Next.js", "TypeScript", "better-sqlite3", "jsPDF", "Nodemailer"],
    power: "Academy site with a complete application pipeline — structured form, server-side persistence, generated PDF, and automated email delivery.",
    highlight: "Each submission becomes a stored record and a generated PDF in one pass, then goes out by email — no manual re-entry anywhere in the loop.",
    repo: null, repoLabel: "Client Project",
  },
  {
    id: "11", name: "The Flashback Cafe", tag: "Brand Site · Tanglish Menu", cat: "Products", mock: "menu-site",
    problem: "A cafe's personality lives in how its regulars talk about it. A translated, sanitised menu throws away exactly the thing that makes people come back.",
    stack: ["Next.js", "React", "CSS"],
    power: "A brand site that presents the menu in the cafe's own Tanglish voice alongside plain English, structured as courses rather than a price list.",
    highlight: "Scroll-sectioned single page — story, menu, room, visit — with the voice of the place kept intact instead of flattened into standard restaurant copy.",
    repo: null, repoLabel: "Client Project",
  },
  {
    id: "12", name: "Kosal-Link", tag: "Landing Page Structure Extractor", cat: "Products", mock: "terminal",
    problem: "Rebuilding a reference landing page means manually re-deriving its structure. Plain scrapers return a tangle of HTML with no sense of which parts are sections.",
    stack: ["Python", "Node.js", "Playwright", "CLI"],
    power: "A four-tool scraper suite: static downloader, browser-based scraper for JS-heavy pages, structure extractor, and a CLI for section detection and component export.",
    highlight: "Renders the page, detects section boundaries, and exports selector-scoped components — turning a live page into a reusable blueprint rather than a flat copy.",
    repo: null, repoLabel: "Company Project", org: "Kosal Tech",
  },
  {
    id: "13", name: "Smart Campus", tag: "Academic Resource Management App", cat: "Mobile", mock: "phone-grid",
    problem: "Academic resources are fragmented across platforms — students waste time hunting for materials across WhatsApp groups, drives, and portals.",
    stack: ["Flutter", "Firebase Auth", "Firestore", "Firebase Storage"],
    power: "Cross-platform mobile app delivering centralised academic resources. Deployed to the Google Play Store.",
    highlight: "Firebase Auth, Firestore and Cloud Storage for secure real-time content delivery, with offline download support.",
    repo: "https://play.google.com/store/apps/details?id=com.schrodingerlab.curiosity", repoLabel: "Play Store",
  },
  {
    id: "14", name: "Drive Track Mate", tag: "Intelligent Driving Monitoring", cat: "Mobile", mock: "phone-timeline",
    problem: "Passive dash cameras record continuous footage without context — finding critical events means scrubbing hours of unstructured video.",
    stack: ["Android", "Dash Camera Integration", "Event-Based Recording"],
    power: "Event-aware recording logic that auto-tags critical driving events with timestamps and contextual metadata.",
    highlight: "Sudden braking and abrupt manoeuvres automatically tagged — reducing post-incident analysis from hours to targeted retrieval.",
    repo: "https://github.com/D-A-R-X/drive-track-mate", repoLabel: "GitHub",
  },
  {
    id: "15", name: "Fitcore", tag: "AI-Based Fitness Tracking System", cat: "Mobile", mock: "phone-progress",
    problem: "Most fitness apps rely on manual input — users manipulate their own data, generating inaccurate progress metrics.",
    stack: ["Flutter", "Firebase Auth", "Firestore"],
    power: "Adaptive fitness progression logic using verified activity data and dynamic experience-based levelling.",
    highlight: "Progress calculated from validated signals, not user-controlled inputs. Cheat-resistant by architecture.",
    repo: null, repoLabel: "In Progress",
  },
];

/* ─── CERTS / ACHIEVEMENTS ───────────────── */
export const CERTS = [
  { issuer: "Oracle",  name: "OCI 2023 Certified", full: "Foundations Associate",              date: "Jun 2024", valid: "Valid until Jun 2026", id: "100672960OCIF2023CA", color: "#60a5fa", img: "Oracle"  },
  { issuer: "NxtWave", name: "AI for Students",    full: "Build Your Own Generative AI Model",  date: "Sep 2024", valid: "",                    id: "",                   color: "#22d3ee", img: "NxtWave" },
  { issuer: "Google",  name: "Digital Unlocked",   full: "Fundamentals of Digital Marketing",   date: "Jan 2021", valid: "",                    id: "6A5 5B9 RR5",        color: "#3b82f6", img: "Google"  },
];

export const ACHIEVEMENTS = [
  { title: "Published Research Paper", detail: "'AI in Retail Marketing' — Conference at PSG College of Arts & Science" },
  { title: "MSME Hackathon",           detail: "Project presentation — Rathinam Institute of Technology" },
  { title: "3+ National Hackathons",   detail: "Project presentations across national-level competitions" },
  { title: "MERN Stack Workshop",      detail: "Explore MERN Stack — CIT Coimbatore, Feb 2025" },
  { title: "MERN Stack Internship",    detail: "VEI Technologies — 30-day full-stack development internship" },
  { title: "Web Dev Internship",       detail: "NoviTech — 15-day intensive web development program" },
];

export const INTERESTS = [
  "AI Systems", "Generative AI", "System Architecture", "Backend Engineering",
  "Android Development", "Prompt Engineering", "Machine Learning", "Product Building",
  "Geospatial Systems", "Music", "Gaming", "Driving",
];

export const PHILOSOPHY = [
  { n: "01", t: "Problem First",      b: "Understand the domain deeply before touching any code. Real clarity precedes architecture." },
  { n: "02", t: "Clean Architecture", b: "Build systems that are readable, maintainable, and extensible — designed to last." },
  { n: "03", t: "Efficient Building", b: "Every component earns its place. Unnecessary complexity is a liability, not a feature." },
  { n: "04", t: "Responsible AI",     b: "Intelligent systems carry accountability. Design with care for the people they affect." },
];

export const GOALS = [
  { n: "01", t: "Build AI Systems",           b: "Production-grade intelligent systems that solve domain-specific problems with measurable impact." },
  { n: "02", t: "Scale Cruza",                b: "Grow Cruza into a recognised independent software studio known for clean, purpose-built systems." },
  { n: "03", t: "Become a Product Engineer",  b: "Design, build, and ship end-to-end systems independently — owning the full stack." },
];
