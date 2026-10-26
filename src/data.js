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
/* ─── EDUCATION ──────────────────────────── */
export const EDUCATION = [
  {
    degree: "B.E. Computer Science & Engineering",
    school: "Dhanalakshmi Srinivasan College of Engineering",
    place: "Coimbatore, Tamil Nadu",
    when: "2022 — 2026",
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
   `blurb` is theirs — so a card can say both without a sentence. */
export const ORGS = {
  "Manju Groups": {
    relation: "Client \u00b7 on contract",
    blurb: "Property development group \u2014 land, sales and operations. Engaged through Manju Global.",
  },
  Aivida: {
    relation: "Group brand · healthcare",
    blurb: "The group's healthcare brand. Airix runs its field outreach — telecallers working doctors, clinics, hospitals and pharmacies, with field visits and onboarding behind them.",
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
    problem: "Field and office staff were spread across disconnected tools — attendance, leave, HR records and team chat each lived somewhere else, so nothing reconciled.",
    stack: ["Kotlin", "MVVM", "Retrofit", "Coroutines", "EncryptedSharedPreferences"],
    power: "A single Android client for the Manju Groups project-management system: OTP authentication, HR, attendance, leave and chat in one app.",
    highlight: "Semantic colour-token design system so every screen themes light/dark from one source. AES256-GCM encrypted local storage for session and credentials.",
    repo: null, repoLabel: "Company Project", org: "Manju Groups",
  },
  {
    id: "02", name: "Airix Geo Tracking", tag: "Live Location & Trip Service", cat: "Professional", mock: "map",
    problem: "Location ingestion was welded into the main application, so tracking load could not scale independently and every tamper or trip feature meant touching the monolith.",
    stack: ["Go", "PostgreSQL", "PostGIS", "TimescaleDB", "Redis", "Docker"],
    power: "A dedicated Go service for location ingestion, live tracking, trip sessions and tamper monitoring — scalable apart from the platform it serves.",
    highlight: "HTTP API plus independently scaled workers. PostGIS + TimescaleDB as system of record, Redis for live state, idempotency and event fan-out. Compatibility adapters keep the existing tracking contracts intact.",
    repo: null, repoLabel: "Company Project", org: "Manju Groups",
  },
  {
    id: "03", name: "Manju PMS Platform", tag: "Land & Project Operations", cat: "Professional", mock: "dashboard",
    problem: "Land procurement, legal clearance, feasibility and channel-partner workflows ran on spreadsheets and messages — no shared state, no audit trail, no way to see where a deal actually stood.",
    stack: ["Next.js", "TypeScript", "Convex", "Tailwind", "Recharts", "AI SDK"],
    power: "A full operations platform covering land procurement, legal and feasibility gates, channel-partner management, reporting and an AI sales assistant.",
    highlight: "Mandatory-field gating per workflow stage so records cannot advance half-complete. Real-time Convex backend, generated Excel/PDF reporting, push notifications and guided in-app tours.",
    repo: null, repoLabel: "Company Project", org: "Manju Groups",
  },
  {
    id: "04", name: "Travel Desk", tag: "Trip Allocation & Fleet Billing", cat: "Professional", mock: "ops-board",
    problem: "Trip requests, driver assignment and billing were coordinated over phone calls — extra kilometres, cancellations and on-site delays were argued after the fact with no evidence.",
    stack: ["Next.js 16", "React 19", "TypeScript", "Tesseract.js", "Tailwind"],
    power: "End-to-end trip desk: request, allocate, dispatch to the driver, track each status transition, and finalise billing against what actually happened.",
    highlight: "Token-scoped driver pages sent over WhatsApp — no driver login needed. OCR on uploaded odometer and document evidence. Explicit states for extra-km, cancellation billing and offline completion.",
    repo: null, repoLabel: "Company Project", org: "Manju Groups",
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
    repo: null, repoLabel: "Client Project", org: "GenZ Reading Academy",
  },
  {
    id: "11", name: "The Flashback Cafe", tag: "Brand Site · Tanglish Menu", cat: "Products", mock: "menu-site",
    problem: "A cafe's personality lives in how its regulars talk about it. A translated, sanitised menu throws away exactly the thing that makes people come back.",
    stack: ["Next.js", "React", "CSS"],
    power: "A brand site that presents the menu in the cafe's own Tanglish voice alongside plain English, structured as courses rather than a price list.",
    highlight: "Scroll-sectioned single page — story, menu, room, visit — with the voice of the place kept intact instead of flattened into standard restaurant copy.",
    repo: null, repoLabel: "Client Project", org: "The Flashback Cafe",
  },
  {
    id: "12", name: "Kosal-Link", tag: "Landing Page Structure Extractor", cat: "Products", mock: "terminal",
    problem: "Rebuilding a reference landing page means manually re-deriving its structure. Plain scrapers return a tangle of HTML with no sense of which parts are sections.",
    stack: ["Python", "Node.js", "Playwright", "CLI"],
    power: "A four-tool scraper suite: static downloader, browser-based scraper for JS-heavy pages, structure extractor, and a CLI for section detection and component export.",
    highlight: "Renders the page, detects section boundaries, and exports selector-scoped components — turning a live page into a reusable blueprint rather than a flat copy.",
    repo: null, repoLabel: "Company Project", org: "Kosal Tech Solutions",
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
  {
    id: "16", name: "Telecaller Core", tag: "Call Operations Service · Go", cat: "Professional", mock: "graph",
    problem: "The telecaller module sat inside the main Convex backend, where retries, follow-ups and daily rollups competed with the rest of the platform and failed quietly.",
    stack: ["Go", "PostgreSQL", "Temporal", "Docker", "REST"],
    power: "A standalone Go service owning the whole call lifecycle: dialer webhooks, incoming, follow-up and outbound lanes, AI call-result commits, the outcome funnel and dashboard APIs.",
    highlight: "Durable work — retried follow-ups, abandoned callbacks, rollups, daily finalize and outbox delivery — runs on self-hosted Temporal, while the hot path stays a single Postgres transaction.",
    repo: null, repoLabel: "Company Project", org: "Manju Groups",
  },
  {
    id: "17", name: "Airix iOS", tag: "Mconnect for iPhone · SwiftUI", cat: "Professional", mock: "phone-grid",
    problem: "Everything the company ran on existed only on Android, so staff on iPhones were locked out of attendance, leave, chat and field work.",
    stack: ["Swift", "SwiftUI", "SwiftData", "REST", "iOS 26"],
    power: "The iOS counterpart to Mconnect against the same production backend: apps grid, attendance, leave, HR, chat, leads, field visits, fleet requests, collections and push notifications.",
    highlight: "A written parity roadmap keeps the backend behaviour identical to the Android client while the interface stays native to iOS rather than a port.",
    repo: null, repoLabel: "Company Project", org: "Manju Groups",
  },
  {
    id: "18", name: "Airix WhatsApp Platform", tag: "Multi-tenant Business Messaging", cat: "Professional", mock: "dashboard",
    problem: "Campaigns, templates and customer replies were scattered across personal phones, with no record of what had been sent or delivered.",
    stack: ["Next.js 16", "React 19", "TypeScript", "Convex", "Clerk", "WhatsApp Cloud API"],
    power: "A multi-tenant platform over the WhatsApp Business Cloud API: account selection, template creation and sync, campaigns, a shared inbox, media and delivery tracking.",
    highlight: "Idempotent sends stop duplicate messages on retry, and a documented server-to-server API lets the other products send their own notifications through it.",
    repo: null, repoLabel: "Company Project", org: "Manju Groups",
  },
  {
    id: "19", name: "Manju Customer App", tag: "Buyer Portal · React Native", cat: "Mobile", mock: "phone-timeline",
    problem: "Buyers had to call the office for payment schedules, documents and the status of every request.",
    stack: ["Expo", "React Native", "Expo Router", "HeroUI Native", "TypeScript"],
    power: "A customer-facing app for property buyers: bookings with a paper-calendar collections view, a document vault, and a support-ticket centre.",
    highlight: "Built design-first against a demo data layer, so the whole flow could be reviewed and reshaped before any of it was wired to the live backend.",
    repo: null, repoLabel: "In Progress", org: "Manju Groups",
  },
  {
    id: "20", name: "Sniper Arena", tag: "Multiplayer Roblox Game", cat: "Products", mock: "gauge",
    problem: "Round-based shooters usually hand out roles at random, so nobody has a stake in who gets the advantage.",
    stack: ["Luau", "Roblox", "Rojo", "DataStore", "Node"],
    power: "A multiplayer arena where a twelve-second coin auction decides who takes the tower as sniper while everyone else runs the open field.",
    highlight: "The sniper wins only by clearing the field; runners win on the clock. Shields, scoped weapons, saved progression and Studio dev-tools round it out.",
    repo: null, repoLabel: "Prototype",
  },
  {
    id: "21", name: "Aivida Airix", tag: "Healthcare Outreach Platform", cat: "Professional", mock: "ops-board",
    problem: "The group's healthcare brand needed the same operations backbone as the property side, but outreach to doctors and clinics has no bookings, projects or land modules — carrying those over would have buried the work that matters.",
    stack: ["Next.js", "Convex", "TypeScript", "Tailwind"],
    power: "Airix rebuilt around healthcare field outreach: telecaller lanes for incoming, follow-up and outbound calls, field visits and online meets, and onboarding for the leads that convert.",
    highlight: "Attendance, HR, tasks, chat and geo-tracking stay shared with the property build, so one codebase lineage serves two very different businesses.",
    repo: null, repoLabel: "Company Project", org: "Aivida",
  },
  {
    id: "22", name: "Aivida Airix Mobile", tag: "Field Apps · Android & iOS", cat: "Mobile", mock: "phone-grid",
    problem: "Telecallers and field staff work from a phone all day. A desktop console is no use standing in a hospital corridor.",
    stack: ["Kotlin", "Jetpack Compose", "Swift", "SwiftUI", "REST"],
    power: "Both clients for the healthcare build: an Android app that is the source of truth for Aivida behaviour, and a SwiftUI iPhone app derived from the Mconnect iOS client.",
    highlight: "Attendance, leave, permissions, loans, the task manager, chat and GeoTrack are shared with Mconnect; only the outreach modules diverge, so a fix in the common ground lands for both brands.",
    repo: null, repoLabel: "Company Project", org: "Aivida",
  },
  {
    id: "23", name: "Airix Subscriptions", tag: "Plans, Seats & Recurring Billing", cat: "Professional", mock: "chart",
    problem: "Selling Airix to hospitals and clinics meant collecting money on a schedule — and a billing bug is the kind a customer notices before you do.",
    stack: ["Next.js", "Convex", "Razorpay", "Node"],
    power: "Subscription purchase end to end: a published plan catalogue, seat assignment that honours role minimums, Razorpay recurring mandates, server-side verification, and a billing tab showing trial countdown, period and invoices.",
    highlight: "Built against a sandbox portal that plays the buying clinic, so the whole mandate flow could be exercised in Razorpay test mode before the real customer portal existed.",
    repo: null, repoLabel: "Company Project", org: "Aivida",
  },
  {
    id: "24", name: "Sentinel X India", tag: "Automated MCX Gold Trading", cat: "Products", mock: "gauge",
    problem: "The original SentinelX read a foreign broker's terminal. Trading Indian commodities meant a different broker, different contracts, and expiry and rollover rules that do not forgive being approximated.",
    stack: ["Python", "Zerodha Kite Connect", "SQLite", "React"],
    power: "SentinelX retargeted at MCX Gold Mini futures through Kite Connect, with a virtual broker terminal, paper-exchange fills, and contract, expiry, rollover and charge rules modelled explicitly.",
    highlight: "Risk caps are structural — at most 1% of capital per trade and 5% in a day — and live trading stays gated off while the paper record is still being judged.",
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
