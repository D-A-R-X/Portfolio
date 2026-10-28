/* ─── CONTENT ────────────────────────────── */

export const NAV_LINKS = ["About", "Experience", "Stack", "Work", "Cruza", "Contact"];

export const CONTACT_LINKS = [
  { label: "Email",    value: "surya777dbs@gmail.com", href: "mailto:surya777dbs@gmail.com" },
  { label: "GitHub",   value: "github.com/D-A-R-X",    href: "https://github.com/D-A-R-X" },
  { label: "LinkedIn", value: "Surya J",               href: "https://www.linkedin.com/in/surya-j-194910306" },
  { label: "WhatsApp", value: "Message me",            href: "https://wa.me/qr/U4KOUOEM4BFXA1" },
];

/* ─── EXPERIENCE ─────────────────────────── */
/* A job with a `site` gets a link to the company in its open row. */
export const EXPERIENCE = [
  {
    company: "Kosal Tech Solutions",
    role: "Software Developer",
    period: "Present",
    current: true,
    sector: "Software Services",
    about:
      "Software services company. I work across internal tooling and client-facing web builds, taking work from the brief through to something running in production.",
    summary:
      "Building internal tooling and client-facing web systems, from CLI tooling to full landing-page delivery.",
    highlights: [
      "Kosal-Link, a four-tool scraper suite in a CLI + backend monorepo. It has a static downloader, a browser-based scraper for JS-heavy pages, a structure extractor, and a CLI that renders a live page, detects section boundaries and exports selector-scoped components as a reusable blueprint.",
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
      "Manju Groups develops and sells residential land and plots. Their internal platform coordinates project, marketing, telecaller, finance, HR and operations work across the whole business, so the engineering work runs from Android in the field to geospatial services on the backend.",
    summary:
      "Contract work across the Manju Groups products: the Android client, the operations platform, and the services behind them.",
    highlights: [
      "Mconnect, the Android client: OTP authentication, HR, attendance, leave and chat. Kotlin + MVVM + Retrofit, AES256-GCM encrypted session storage, and a semantic colour-token design system driving light and dark from one source.",
      "The operations platform, a Next.js + Convex ERP covering land procurement, CRM and site visits, channel-partner management, marketing budgets with campaign spend approval, finance ledgers and outstanding reports, HR and attendance, fleet and complaints.",
      "Airix Geo Tracking, a dedicated Go service for location ingestion, live tracking, trip sessions and tamper monitoring on PostgreSQL/PostGIS + TimescaleDB, with Redis for live state and idempotency.",
      "Travel Desk, for trip allocation and fleet billing, with token-scoped driver pages delivered over WhatsApp and OCR on uploaded odometer evidence.",
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
/* ─── EDUCATION ──────────────────────────── */
export const EDUCATION = [
  {
    degree: "B.E. Computer Science & Engineering",
    school: "Dhanalakshmi Srinivasan College of Engineering",
    site: "https://dsce.ac.in/",
    place: "Coimbatore, Tamil Nadu",
    when: "2022 – 2026",
    score: "CGPA 7.43 / 10",
    note: "Coursework in data structures, databases, networks and machine learning, alongside production work in Android and full-stack development.",
  },
];

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

/* ─── WHO THE WORK WAS FOR ───────────────────
   Keyed by the `org` on each project. `relation` is my side of it,
   `blurb` is theirs, so a card can say both without a sentence. */
export const ORGS = {
  "Manju Groups": {
    relation: "Client · on contract",
    blurb: "Property development group working across land, sales and operations. Engaged through Manju Global.",
  },
  Aivida: {
    relation: "Group brand · healthcare",
    blurb: "The group's healthcare brand. Airix runs its field outreach: telecallers working with doctors, clinics, hospitals and pharmacies, backed by field visits and onboarding.",
  },
  "Kosal Tech Solutions": {
    relation: "Employer",
    blurb: "Software services company. Internal tooling and client-facing web work.",
  },
  Cruza: {
    relation: "My studio",
    blurb: "Independent software studio I co-founded, building intelligent systems.",
  },
  "GenZ Reading Academy": {
    relation: "Client",
    blurb: "Reading academy running admissions and student programmes.",
  },
  "The Flashback Cafe": {
    relation: "Client",
    blurb: "Neighbourhood cafe, menu and brand in its own voice.",
  },
};

/* ─── PROJECTS ───────────────────────────── */
export const PROJECT_FILTERS = ["All", "Professional", "AI Systems", "Products", "Mobile"];

export const PROJECTS = [
  {
    id: "01", name: "Mconnect", tag: "Manju Groups PMS · Android", cat: "Professional", mock: "phone-app",
    problem: "Field and office staff were spread across disconnected tools. Attendance, leave, HR records and team chat each lived somewhere else, so nothing reconciled.",
    context: "Field and office teams at Manju Groups were juggling separate apps for attendance, leave approvals, HR records and internal chat. Nothing stayed in sync across sites.",
    engineering: "I built a single native Android client in Kotlin with MVVM and Coroutines, covering OTP sign-in, HR, attendance, leave and chat. A semantic colour-token system handles light and dark theming from one source, and session credentials are stored with AES256-GCM encryption.",
    stack: ["Kotlin", "MVVM", "Retrofit", "Coroutines", "EncryptedSharedPreferences"],
    power: "A single Android client for the Manju Groups project-management system: OTP authentication, HR, attendance, leave and chat in one app.",
    highlight: "Semantic colour-token design system so every screen themes light/dark from one source. AES256-GCM encrypted local storage for session and credentials.",
    repo: null, repoLabel: "Company Project", org: "Manju Groups",
    variants: [
      {
        name: "Aivida Airix Mobile · Android & iOS",
        org: "Aivida",
        note: "Both field clients for the healthcare brand. The Android app is the source of truth for Aivida behaviour, with a SwiftUI iPhone client derived from the Mconnect iOS build; attendance, leave, permissions, loans, tasks, chat and GeoTrack are shared, and only the outreach modules diverge.",
      },
    ],
  },
  {
    id: "02", name: "Airix Geo Tracking", tag: "Live Location & Trip Service", cat: "Professional", mock: "map",
    problem: "Location ingestion was welded into the main application, so tracking load could not scale independently and every tamper or trip feature meant touching the monolith.",
    context: "Location tracking was built into the main application, so it couldn't scale on its own. Every trip or tamper-detection feature meant changing the monolith.",
    engineering: "I moved location ingestion, live tracking, trip sessions and tamper monitoring into a dedicated Go service, with an HTTP API and workers that scale independently. PostGIS and TimescaleDB are the system of record, and Redis handles live state, idempotency and event fan-out. Compatibility adapters keep the existing tracking contracts working.",
    stack: ["Go", "PostgreSQL", "PostGIS", "TimescaleDB", "Redis", "Docker"],
    power: "A dedicated Go service for location ingestion, live tracking, trip sessions and tamper monitoring that scales separately from the platform it serves.",
    highlight: "HTTP API plus independently scaled workers. PostGIS + TimescaleDB as system of record, Redis for live state, idempotency and event fan-out. Compatibility adapters keep the existing tracking contracts intact.",
    repo: null, repoLabel: "Company Project", org: "Manju Groups",
    variants: [
      {
        name: "Geo Tracking · Aivida",
        org: "Aivida",
        note: "The same service for the healthcare brand on its own domain, with separate Nginx, CORS allowlist, compose files and deploy workflows, so trouble on one side cannot reach the other.",
      },
    ],
  },
  {
    id: "03", name: "Manju PMS Platform", tag: "Land & Project Operations", cat: "Professional", mock: "dashboard",
    problem: "Land procurement, legal clearance, feasibility and channel-partner workflows ran on spreadsheets and messages. There was no shared state, no audit trail, and no way to see where a deal actually stood.",
    context: "Land deals went through procurement, legal clearance, feasibility checks and channel partners, all tracked in spreadsheets and message threads. Nobody could tell where a deal stood or who had changed what.",
    engineering: "I built an operations platform in Next.js, TypeScript and Convex covering land procurement, legal and feasibility gates, channel-partner management, reporting and an AI sales assistant. Each workflow stage has mandatory fields, so a record can't move forward half-filled. The Convex backend keeps everything in real time, and the platform generates Excel and PDF reports, sends push notifications and runs guided in-app tours.",
    stack: ["Next.js", "TypeScript", "Convex", "Tailwind", "Recharts", "AI SDK"],
    power: "A full operations platform covering land procurement, legal and feasibility gates, channel-partner management, reporting and an AI sales assistant.",
    highlight: "Mandatory-field gating per workflow stage so records cannot advance half-complete. Real-time Convex backend, generated Excel/PDF reporting, push notifications and guided in-app tours.",
    repo: null, repoLabel: "Company Project", org: "Manju Groups",
    variants: [
      {
        name: "Aivida Airix · Healthcare build",
        org: "Aivida",
        note: "The platform rebuilt for the group's healthcare brand: telecaller lanes for incoming, follow-up and outbound calls, field visits, online meets and onboarding for leads that convert. The bookings, projects and land modules come out entirely; attendance, HR, tasks, chat and geo-tracking stay shared.",
      },
      {
        name: "Airix Subscriptions · Plans and billing",
        org: "Aivida",
        note: "Selling the platform to hospitals and clinics: a published plan catalogue, seat assignment that honours role minimums, Razorpay recurring mandates with server-side verification, and a billing tab showing trial countdown, current period and invoices. Exercised against a sandbox portal that plays the buying clinic, so the mandate flow was proven in test mode before the real portal existed.",
      },
    ],
  },
  {
    id: "04", name: "Travel Desk", tag: "Trip Allocation & Fleet Billing", cat: "Professional", mock: "ops-board",
    problem: "Trip requests, driver assignment and billing were coordinated over phone calls. Extra kilometres, cancellations and on-site delays were argued about after the fact, with no evidence.",
    context: "Trips were requested, assigned and billed over phone calls. When someone disputed extra kilometres, a cancellation or a delay on site, there was no record to settle it.",
    engineering: "I built the trip desk end to end in Next.js 16 and React 19: a request gets allocated, dispatched to the driver, tracked through each status change and billed against what actually happened. Drivers get a token-scoped page over WhatsApp instead of a login, and Tesseract.js runs OCR on the odometer and document photos they upload. Extra kilometres, cancellation billing and offline completion each have their own explicit state.",
    stack: ["Next.js 16", "React 19", "TypeScript", "Tesseract.js", "Tailwind"],
    power: "End-to-end trip desk: request, allocate, dispatch to the driver, track each status transition, and finalise billing against what actually happened.",
    highlight: "Token-scoped driver pages sent over WhatsApp, so drivers don't need a login. OCR on uploaded odometer and document evidence. Explicit states for extra-km, cancellation billing and offline completion.",
    repo: null, repoLabel: "Company Project", org: "Manju Groups",
  },
  {
    id: "05", name: "Mentorix", tag: "AI Career Intelligence System", cat: "AI Systems", mock: "gauge",
    problem: "Students receive generic career advice that ignores behavioural patterns and decision history. Static data can't capture how a student actually changes over time.",
    context: "Career advice for students tends to be generic. It works from static data and misses how a student's behaviour and decisions change over time.",
    engineering: "I built a FastAPI backend on SQLite with separate REST APIs for career prediction and behavioural analytics. A RandomForest model predicts career instability and suggests personalised paths, and an explainability layer returns the reasoning behind each result along with the score. It's deployed on Render and Vercel.",
    stack: ["Python", "FastAPI", "RandomForest", "SQLite", "HTML/CSS/JS"],
    power: "AI-driven engine that analyses student behaviour patterns to predict career instability and recommend personalised career paths.",
    highlight: "Modular REST APIs for career prediction and behavioural analytics. RandomForest ML with an explainable AI layer that returns its reasoning along with the score. Deployed on Render + Vercel.",
    repo: "https://github.com/D-A-R-X/mentorix-ai", repoLabel: "GitHub", org: "Cruza",
  },
  {
    id: "06", name: "Megatron", tag: "Modular Adaptive AI Control System", cat: "AI Systems", mock: "graph",
    problem: "Single-purpose AI systems are brittle. Adding a new capability means rewriting core logic, so they never really scale.",
    context: "Most single-purpose AI systems break when you try to extend them. Every new capability means rewriting the core.",
    engineering: "I built a modular AI controller in Python and FastAPI. A central reasoning layer works out the intent of a request and hands it to a specialised module, and each module returns its own structured output. New capabilities go in as new modules without changing the core logic.",
    stack: ["Python", "FastAPI", "HTML", "CSS", "JavaScript"],
    power: "Modular AI controller with a central reasoning layer that analyses intent and delegates to specialised modules.",
    highlight: "New capabilities are added without touching core logic. Each module returns structured output on its own, so the system stays easy to extend.",
    repo: "https://github.com/D-A-R-X/Megatron", repoLabel: "GitHub",
  },
  {
    id: "07", name: "Darx Dialer", tag: "Default Phone App + Cloud Recording", cat: "Products", mock: "phone-dialer",
    problem: "Client and staff calls carry commitments nobody writes down. Stock dialers give you a call log and nothing else, with no searchable record of what was actually agreed.",
    context: "Calls with clients and staff often include commitments that never get written down. The stock dialer only keeps a call log, so there's no way to look back at what was agreed.",
    engineering: "I built a full replacement for the default dialer in Kotlin and Jetpack Compose: incoming and outgoing calls, contacts, recents, and per-call recording synced to cloud storage. It implements InCallService and holds the DIALER role, so Android routes every call through it, including the lock-screen incoming UI, Bluetooth routing, DTMF and hold. Recording is always disclosed, with an on-screen indicator and a persistent notification, and the user can switch it off.",
    stack: ["Kotlin", "Jetpack Compose", "InCallService", "Convex", "Material 3"],
    power: "A full default-dialer replacement: outgoing and incoming calls, contacts, recents, and disclosed per-call recording synced to cloud storage.",
    highlight: "Implements InCallService and the DIALER role, so Android routes every call through it: lock-screen incoming UI, Bluetooth routing, DTMF, hold. Recording is consent-first, with an on-screen indicator, a persistent notification and a user toggle. It is never covert.",
    repo: null, repoLabel: "Private Build",
  },
  {
    id: "08", name: "Brownie Care", tag: "AI Companion Health App", cat: "Products", mock: "phone-companion",
    problem: "Health apps nag. They track numbers and push reminders, and people abandon them because nothing in the app actually feels like it cares whether you show up.",
    context: "Most health apps just track numbers and send reminders, and people stop opening them. Nothing in them feels like it cares whether you come back.",
    engineering: "I built the app around DARX, a companion character drawn entirely in Compose Canvas with spring animations and no image assets, who reacts, talks and reminds you using llama-3.3-70b through Groq. DataStore is the source of truth on the device and Convex is a best-effort cloud mirror, so the app works fully offline.",
    stack: ["Kotlin", "Compose Canvas", "Groq LLM", "Convex", "WorkManager", "DataStore"],
    power: "A personal health companion built around DARX, a character drawn entirely in Compose Canvas who reacts, talks and reminds, powered by llama-3.3-70b.",
    highlight: "No character assets: every frame of DARX is procedurally drawn with spring animations. DataStore is the source of truth with Convex as a best-effort cloud mirror, so the app works fully offline.",
    repo: null, repoLabel: "Private Build",
  },
  {
    id: "09", name: "Sentinel X", tag: "Trading Automation · MetaTrader 5", cat: "Products", mock: "chart",
    problem: "Trading a strategy by hand means late entries, risk rules bent in the moment and exits made on nerves. A strategy is only worth something if it runs the same way on every trade.",
    context: "Trading a strategy by hand means late entries, risk rules bent in the moment, and exits made on nerves. A strategy only proves anything if it runs the same way on every trade.",
    engineering: "I built the trader as a Python service that drives MetaTrader 5 for forex and gold: a strategy engine, position sizing and a daily target, with an AI step that reviews each setup before entry and a strategist that researches changes, which stay locked out of the live settings unless I allow them. A watchdog brings it back when MetaTrader is closed and reopened, and the machine is kept awake while it trades. It started as a paper-only Telegram signal tracker, and the SentinelX Pine Script strategies still check setups on TradingView.",
    stack: ["Python", "MetaTrader 5", "Next.js", "Convex", "React Native", "Pine Script"],
    power: "Automated forex and gold trading on MetaTrader 5, run from a desktop app on Windows and macOS, a web control panel and a React Native phone app.",
    highlight: "The risk rules are part of the structure, not settings the AI can touch: once the day's target is reached, a later trade may only risk the profit above it, and a recovery trade never risks starting capital.",
    repo: null, repoLabel: "Private Build",
  },
  {
    id: "10", name: "GenZ Reading Academy", tag: "Academy Site & Admissions Flow", cat: "Products", mock: "landing",
    problem: "Admissions ran on forms that produced nothing usable. Enquiries arrived as raw text with no record, no document, and no reliable follow-up.",
    context: "The academy's admission forms just sent over raw text. Nothing was stored, no document was produced, and follow-up depended on someone remembering.",
    engineering: "I built the academy site in Next.js and TypeScript with a full application pipeline behind a structured form. Each submission is saved server-side with better-sqlite3, turned into a PDF with jsPDF and emailed out through Nodemailer in one pass, so nobody has to re-enter anything.",
    stack: ["Next.js", "TypeScript", "better-sqlite3", "jsPDF", "Nodemailer"],
    power: "Academy site with a complete application pipeline: structured form, server-side persistence, generated PDF, and automated email delivery.",
    highlight: "Each submission becomes a stored record and a generated PDF in one pass, then goes out by email. Nobody has to re-enter anything along the way.",
    repo: null, repoLabel: "Client Project", org: "GenZ Reading Academy",
  },
  {
    id: "11", name: "The Flashback Cafe", tag: "Brand Site · Tanglish Menu", cat: "Products", mock: "menu-site",
    problem: "A cafe's personality lives in how its regulars talk about it. A translated, sanitised menu throws away exactly the thing that makes people come back.",
    context: "A lot of the cafe's character is in how its regulars talk about it. A cleaned-up, translated menu would lose exactly that.",
    engineering: "I built a single-page brand site in Next.js and React, split into scroll sections for the story, menu, room and visit. The menu is written in the cafe's own Tanglish alongside plain English and grouped into courses instead of a price list.",
    stack: ["Next.js", "React", "CSS"],
    power: "A brand site that presents the menu in the cafe's own Tanglish voice alongside plain English, structured as courses rather than a price list.",
    highlight: "Scroll-sectioned single page (story, menu, room, visit) that keeps the voice of the place instead of flattening it into standard restaurant copy.",
    repo: null, repoLabel: "Client Project", org: "The Flashback Cafe",
  },
  {
    id: "12", name: "Kosal-Link", tag: "Landing Page Structure Extractor", cat: "Products", mock: "terminal",
    problem: "Rebuilding a reference landing page means manually re-deriving its structure. Plain scrapers return a tangle of HTML with no sense of which parts are sections.",
    context: "Rebuilding a reference landing page meant working out its structure by hand. Ordinary scrapers return a pile of HTML with no idea where one section ends and the next begins.",
    engineering: "I built a suite of four tools in Python and Node.js: a static downloader, a Playwright scraper for JS-heavy pages, a structure extractor, and a CLI. The CLI renders the live page, finds the section boundaries and exports selector-scoped components, so the output is a reusable blueprint rather than a flat copy.",
    stack: ["Python", "Node.js", "Playwright", "CLI"],
    power: "A four-tool scraper suite: static downloader, browser-based scraper for JS-heavy pages, structure extractor, and a CLI for section detection and component export.",
    highlight: "Renders the page, detects section boundaries, and exports selector-scoped components, so a live page becomes a reusable blueprint rather than a flat copy.",
    repo: null, repoLabel: "Company Project", org: "Kosal Tech Solutions",
  },
  {
    id: "13", name: "Smart Campus", tag: "Academic Resource Management App", cat: "Mobile", mock: "phone-grid",
    problem: "Academic resources are scattered across platforms, and students waste time hunting for materials across WhatsApp groups, drives and portals.",
    context: "Study material was spread across WhatsApp groups, shared drives and college portals, and students lost time just finding it.",
    engineering: "I built a cross-platform Flutter app that puts academic resources in one place, and shipped it to the Google Play Store. Firebase Auth, Firestore and Firebase Storage handle secure, real-time content delivery, and resources can be downloaded for offline use.",
    stack: ["Flutter", "Firebase Auth", "Firestore", "Firebase Storage"],
    power: "Cross-platform mobile app delivering centralised academic resources. Deployed to the Google Play Store.",
    highlight: "Firebase Auth, Firestore and Cloud Storage for secure real-time content delivery, with offline download support.",
    repo: "https://play.google.com/store/apps/details?id=com.schrodingerlab.curiosity", repoLabel: "Play Store",
  },
  {
    id: "14", name: "Drive Track Mate", tag: "Intelligent Driving Monitoring", cat: "Mobile", mock: "phone-timeline",
    problem: "Passive dash cameras record continuous footage with no context, so finding a critical event means scrubbing through hours of unstructured video.",
    context: "Dash cams record hours of footage with no markers. Finding the moment something went wrong means scrubbing through all of it.",
    engineering: "I wrote event-aware recording logic for Android that works with the dash camera and tags critical driving events with timestamps and context metadata. Sudden braking and abrupt manoeuvres are flagged automatically, so after an incident you can go straight to the footage that matters.",
    stack: ["Android", "Dash Camera Integration", "Event-Based Recording"],
    power: "Event-aware recording logic that auto-tags critical driving events with timestamps and contextual metadata.",
    highlight: "Sudden braking and abrupt manoeuvres are tagged automatically, so post-incident analysis becomes targeted retrieval instead of hours of footage.",
    repo: "https://github.com/D-A-R-X/drive-track-mate", repoLabel: "GitHub",
  },
  {
    id: "15", name: "Fitcore", tag: "AI-Based Fitness Tracking System", cat: "Mobile", mock: "phone-progress",
    problem: "Most fitness apps rely on manual input, so users can manipulate their own data and the progress numbers end up inaccurate.",
    context: "Most fitness apps trust whatever the user types in, so people can inflate their own numbers and the progress tracking stops meaning much.",
    engineering: "I'm building it in Flutter with Firebase Auth and Firestore. Progress and experience-based levelling are calculated from verified activity data instead of manual entries, so the numbers are hard to fake by design.",
    stack: ["Flutter", "Firebase Auth", "Firestore"],
    power: "Adaptive fitness progression logic using verified activity data and dynamic experience-based levelling.",
    highlight: "Progress is calculated from validated signals rather than inputs the user controls. The architecture itself makes it hard to cheat.",
    repo: null, repoLabel: "In Progress",
  },
  {
    id: "16", name: "Telecaller Core", tag: "Call Operations Service · Go", cat: "Professional", mock: "graph",
    problem: "The telecaller module sat inside the main Convex backend, where retries, follow-ups and daily rollups competed with the rest of the platform and failed quietly.",
    context: "The telecaller module lived inside the main Convex backend. Retries, follow-ups and daily rollups competed with everything else on the platform and failed without anyone noticing.",
    engineering: "I moved the whole call lifecycle into a standalone Go service on PostgreSQL: dialer webhooks, the incoming, follow-up and outbound lanes, AI call-result commits, the outcome funnel and the dashboard APIs. Durable work like follow-up retries, abandoned callbacks, rollups, the daily finalize and outbox delivery runs on self-hosted Temporal. The hot path stays a single Postgres transaction.",
    stack: ["Go", "PostgreSQL", "Temporal", "Docker", "REST"],
    power: "A standalone Go service owning the whole call lifecycle: dialer webhooks, incoming, follow-up and outbound lanes, AI call-result commits, the outcome funnel and dashboard APIs.",
    highlight: "Durable work (retried follow-ups, abandoned callbacks, rollups, daily finalize and outbox delivery) runs on self-hosted Temporal, while the hot path stays a single Postgres transaction.",
    repo: null, repoLabel: "Company Project", org: "Manju Groups",
    variants: [
      {
        name: "Telecaller Core · Aivida",
        org: "Aivida",
        note: "A sibling repository with its own git history and migrations, carrying healthcare-specific queue summaries, project-scoped lead lists and carry-forward rules. Core improvements are ported commit by commit and adapted rather than merged wholesale, so neither brand inherits the other's assumptions.",
      },
    ],
  },
  {
    id: "17", name: "Airix iOS", tag: "Mconnect for iPhone · SwiftUI", cat: "Professional", mock: "phone-grid",
    problem: "Everything the company ran on existed only on Android, so staff on iPhones were locked out of attendance, leave, chat and field work.",
    context: "Every internal tool the company used was Android-only, so staff with iPhones couldn't mark attendance, apply for leave, use chat or do their field work.",
    engineering: "I built the iOS counterpart to Mconnect in Swift, SwiftUI and SwiftData against the same production backend: apps grid, attendance, leave, HR, chat, leads, field visits, fleet requests, collections and push notifications. A written parity roadmap keeps backend behaviour identical to the Android client, while the interface is built natively for iOS instead of being ported.",
    stack: ["Swift", "SwiftUI", "SwiftData", "REST", "iOS 26"],
    power: "The iOS counterpart to Mconnect against the same production backend: apps grid, attendance, leave, HR, chat, leads, field visits, fleet requests, collections and push notifications.",
    highlight: "A written parity roadmap keeps the backend behaviour identical to the Android client while the interface stays native to iOS rather than a port.",
    repo: null, repoLabel: "Company Project", org: "Manju Groups",
  },
  {
    id: "18", name: "Airix WhatsApp Platform", tag: "Multi-tenant Business Messaging", cat: "Professional", mock: "dashboard",
    problem: "Campaigns, templates and customer replies were scattered across personal phones, with no record of what had been sent or delivered.",
    context: "Campaigns, message templates and customer replies were spread across people's personal phones. There was no record of what had gone out or whether it was delivered.",
    engineering: "I built a multi-tenant platform on the WhatsApp Business Cloud API with Next.js 16, Convex and Clerk, covering account selection, template creation and sync, campaigns, a shared inbox, media and delivery tracking. Sends are idempotent, so a retry never produces a duplicate message, and a documented server-to-server API lets the other products send their own notifications through it.",
    stack: ["Next.js 16", "React 19", "TypeScript", "Convex", "Clerk", "WhatsApp Cloud API"],
    power: "A multi-tenant platform over the WhatsApp Business Cloud API: account selection, template creation and sync, campaigns, a shared inbox, media and delivery tracking.",
    highlight: "Idempotent sends stop duplicate messages on retry, and a documented server-to-server API lets the other products send their own notifications through it.",
    repo: null, repoLabel: "Company Project", org: "Manju Groups",
  },
  {
    id: "19", name: "Manju Customer App", tag: "Buyer Portal · React Native", cat: "Mobile", mock: "phone-timeline",
    problem: "Buyers had to call the office for payment schedules, documents and the status of every request.",
    context: "Property buyers had to phone the office to get their payment schedule, their documents, or an update on any request they'd made.",
    engineering: "I'm building a buyer app in Expo and React Native with bookings, a paper-calendar view of collections, a document vault and a support-ticket centre. I built it design-first against a demo data layer, so the whole flow could be reviewed and reshaped before any of it was wired to the live backend.",
    stack: ["Expo", "React Native", "Expo Router", "HeroUI Native", "TypeScript"],
    power: "A customer-facing app for property buyers: bookings with a paper-calendar collections view, a document vault, and a support-ticket centre.",
    highlight: "Built design-first against a demo data layer, so the whole flow could be reviewed and reshaped before any of it was wired to the live backend.",
    repo: null, repoLabel: "In Progress", org: "Manju Groups",
  },
  {
    id: "20", name: "Sniper Arena", tag: "Multiplayer Roblox Game", cat: "Products", mock: "gauge",
    problem: "Round-based shooters usually hand out roles at random, so nobody has a stake in who gets the advantage.",
    context: "Most round-based shooters assign roles at random, so players have no say in who gets the advantage.",
    engineering: "I built a multiplayer Roblox arena in Luau with Rojo, where a twelve-second coin auction decides who takes the tower as sniper while everyone else runs the open field. The sniper wins only by clearing the field and the runners win on the clock. Shields, scoped weapons, progression saved with DataStore and a set of Studio dev tools fill out the rest.",
    stack: ["Luau", "Roblox", "Rojo", "DataStore", "Node"],
    power: "A multiplayer arena where a twelve-second coin auction decides who takes the tower as sniper while everyone else runs the open field.",
    highlight: "The sniper wins only by clearing the field; runners win on the clock. Shields, scoped weapons, saved progression and Studio dev-tools round it out.",
    repo: null, repoLabel: "Prototype",
  },
  {
    id: "21", name: "Sentinel X India", tag: "Trading Automation · MCX via Fyers & Zerodha", cat: "Products", mock: "gauge",
    problem: "Indian residents can't trade offshore forex, so the MetaTrader 5 build couldn't simply be pointed at Indian markets. MCX futures need a SEBI-registered broker, different contracts, and expiry and rollover rules that do not forgive being approximated.",
    context: "Sentinel X ran on MetaTrader 5, which Indian residents can't use for offshore forex. Trading in India meant MCX futures through a SEBI-registered broker, with its own contracts, expiries and rollover rules.",
    engineering: "The same Sentinel X core runs on a virtual broker terminal that speaks MetaTrader-style calls. Fyers supplies live MCX prices, 1-minute candles and history for tuning; Zerodha Kite Connect places the orders, with the stop-loss held at the broker as a separate SL-M order. Contracts, expiry, rollover, exchange spread and charges are modelled explicitly, and paper fills are the default.",
    stack: ["Python", "Fyers API", "Zerodha Kite Connect", "SQLite", "React"],
    power: "Sentinel X for Indian commodities: MCX futures traded on my own account through Zerodha, on live Fyers prices, from the same panel and phone app.",
    highlight: "Real money stays off until it is switched on per broker account, with at most 1% risk per trade and 5% daily loss checked before every order, a kill switch, and the 2026 API trading rules (static IP, exchange Algo ID, order-rate limits) built in.",
    repo: null, repoLabel: "Private Build",
  },
];

/* ─── CERTS / ACHIEVEMENTS ───────────────── */
export const CERTS = [
  { issuer: "Oracle",  name: "OCI 2023 Certified", full: "Foundations Associate",              date: "Jun 2024", valid: "Valid until Jun 2026", id: "100672960OCIF2023CA", color: "#60a5fa", img: "Oracle"  },
  { issuer: "NxtWave", name: "AI for Students",    full: "Build Your Own Generative AI Model",  date: "Sep 2024", valid: "",                    id: "",                   color: "#22d3ee", img: "NxtWave" },
  { issuer: "Google",  name: "Digital Unlocked",   full: "Fundamentals of Digital Marketing",   date: "Jan 2021", valid: "",                    id: "6A5 5B9 RR5",        color: "#3b82f6", img: "Google"  },
];

export const ACHIEVEMENTS = [
  { title: "Published Research Paper", detail: "'AI in Retail Marketing', presented at a conference at PSG College of Arts & Science" },
  { title: "MSME Hackathon",           detail: "Project presentation at Rathinam Institute of Technology" },
  { title: "3+ National Hackathons",   detail: "Project presentations across national-level competitions" },
  { title: "MERN Stack Workshop",      detail: "Explore MERN Stack at CIT Coimbatore, Feb 2025" },
  { title: "MERN Stack Internship",    detail: "30-day full-stack development internship at VEI Technologies" },
  { title: "Web Dev Internship",       detail: "15-day intensive web development program at NoviTech" },
];

export const INTERESTS = [
  "AI Systems", "Generative AI", "System Architecture", "Backend Engineering",
  "Android Development", "Prompt Engineering", "Machine Learning", "Product Building",
  "Geospatial Systems", "Music", "Gaming", "Driving",
];

export const PHILOSOPHY = [
  { n: "01", t: "Problem First",      b: "Understand the domain deeply before touching any code. Real clarity precedes architecture." },
  { n: "02", t: "Clean Architecture", b: "Build systems that are readable, maintainable and extensible, so they last." },
  { n: "03", t: "Efficient Building", b: "Every component earns its place. Unnecessary complexity is a liability, not a feature." },
  { n: "04", t: "Responsible AI",     b: "Intelligent systems carry accountability. Design with care for the people they affect." },
];

export const GOALS = [
  { n: "01", t: "Build AI Systems",           b: "Production-grade intelligent systems that solve domain-specific problems with measurable impact." },
  { n: "02", t: "Scale Cruza",                b: "Grow Cruza into a recognised independent software studio known for clean, purpose-built systems." },
  { n: "03", t: "Become a Product Engineer",  b: "Design, build and ship end-to-end systems independently, owning the full stack." },
];
