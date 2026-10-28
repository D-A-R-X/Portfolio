# -*- coding: utf-8 -*-
"""Everything the resume says, kept apart from how it is drawn.

Edit this file to change the resume's content; build_resume.py only lays it
out. Keep it in step with src/data.js, which feeds the portfolio site.
"""

NAME    = "Surya J"
TITLE   = "App & Web Developer"
TAGLINE = "Android  ·  Full-stack  ·  AI systems"

# order matters: a parser reads this line left to right
CONTACT = [
    "surya777dbs@gmail.com",
    "Chennai, Tamil Nadu, India",
    "github.com/D-A-R-X",
    "linkedin.com/in/surya-j-194910306",
]

PROFILE = (
    "App and web developer building production Android and full-stack systems. Software developer at "
    "Kosal Tech Solutions, with a contract engagement at Manju Global — delivering Kotlin/Compose mobile "
    "apps, Next.js platforms, and the Go and Python services behind them. B.E. Computer Science & "
    "Engineering, 2022–2026. Co-founder of Cruza, an independent software studio. Focused on AI-powered "
    "applications and architecture that stays readable for whoever maintains it next."
)

# grouped so a keyword scan finds them, and a person can skim them
SKILLS = [
    ("Languages",  "Python, JavaScript, TypeScript, Kotlin, Dart, Go, SQL"),
    ("Mobile",     "Android (Kotlin, Jetpack Compose, MVVM), Material 3, Flutter"),
    ("Web",        "React, Next.js, Node.js, HTML, CSS, Tailwind CSS"),
    ("Backend",    "FastAPI, Express.js, Convex, Firebase, REST APIs, WebSockets"),
    ("Data",       "PostgreSQL, PostGIS, TimescaleDB, MongoDB, Redis, SQLite, Firestore"),
    ("AI / ML",    "Machine Learning, Generative AI, Prompt Engineering, scikit-learn, LLM APIs"),
    ("Tooling",    "Git, GitHub, Docker, Gradle, VS Code, Android Studio"),
    ("Deployment", "Vercel, Render, Google Play Store"),
]

JOBS = [
    {
        "role": "Software Developer",
        "org": "Kosal Tech Solutions",
        "when": "CURRENT",
        "points": [
            "Build internal tooling and client-facing web systems across the company's delivery work.",
            "Developed Kosal-Link, a four-tool scraper suite — static downloader, browser-based scraper for "
            "JS-heavy pages, structure extractor, and a CLI that renders a live landing page, detects section "
            "boundaries, and exports selector-scoped components as a reusable blueprint.",
            "Built and shipped client landing pages and marketing sites end to end.",
        ],
    },
    {
        "role": "App & Web Developer · Contract",
        "org": "Manju Global",
        "when": "CONTRACT",
        "points": [
            "Mconnect — Android client for the group's project-management system: OTP authentication, HR, "
            "attendance, leave and chat. Kotlin + MVVM + Retrofit, AES256-GCM encrypted session storage, and a "
            "semantic colour-token design system driving light and dark from one source. A SwiftUI iPhone client "
            "follows the same backend to a written parity roadmap.",
            "Manju PMS platform — Next.js + Convex operations platform covering land procurement, legal and "
            "feasibility gating, channel-partner management, Excel/PDF reporting and an AI sales assistant.",
            "Telecaller Core — extracted call operations into a standalone Go service: dialer webhooks, "
            "incoming/follow-up/outbound lanes and the outcome funnel, with retries, callbacks, rollups and outbox "
            "delivery as durable Temporal workflows while the hot path stays one Postgres transaction.",
            "Airix Geo Tracking — Go service for location ingestion, live tracking, trip sessions and tamper "
            "monitoring on PostgreSQL/PostGIS + TimescaleDB, with Redis for live state and idempotency.",
            "Travel Desk — Next.js trip allocation and fleet billing: token-scoped driver pages delivered over "
            "WhatsApp with no driver login, OCR on uploaded odometer evidence, and explicit extra-km, cancellation "
            "and offline-completion states. A multi-tenant WhatsApp Business Cloud API platform — templates, "
            "campaigns, shared inbox and idempotent sends — backs it and the other products.",
            "Airix for Aivida — carried the platform into the group's healthcare brand across web, Android and "
            "iOS: telecaller lanes, field visits and lead onboarding for doctors and clinics, sharing attendance, "
            "HR, chat and geo-tracking with the property build. Added subscriptions — plan catalogue, seat "
            "assignment with role minimums, Razorpay recurring mandates with server-side verification, trials and "
            "invoices — so it could be sold to clinics on a schedule.",
        ],
    },
    {
        "role": "MERN Stack Developer Intern",
        "org": "VEI Technologies",
        "when": "JAN–FEB 2025",
        "points": [
            "Developed full-stack modules using MongoDB, Express.js, React and Node.js.",
            "Built and integrated REST APIs connecting frontend components with backend services across agile sprints.",
        ],
    },
    {
        "role": "Web Development Intern",
        "org": "NoviTech",
        "when": "JAN 2025",
        "points": [
            "Designed responsive web interfaces in HTML, CSS and JavaScript, integrating backend services and "
            "optimising page performance across multiple modules.",
        ],
    },
]

PROJECTS = [
    {
        "name": "Mentorix",
        "tag": "AI Career Intelligence System",
        "stack": "Python · FastAPI · RandomForest · SQLite · Vercel / Render",
        "link": "github.com/D-A-R-X/mentorix-ai",
        "blurb": "AI engine analysing student behaviour patterns to predict career instability and recommend "
                 "personalised paths. Modular FastAPI REST services with a RandomForest model behind an "
                 "explainable AI layer that returns reasoning, not just scores.",
    },
    {
        "name": "Darx Dialer",
        "tag": "Default Phone App with Cloud Recording",
        "stack": "Kotlin · Jetpack Compose · InCallService · Convex",
        "link": None,
        "blurb": "Full default-dialer replacement implementing InCallService and the DIALER role — lock-screen "
                 "incoming UI, Bluetooth routing, DTMF and hold. Per-call recording is consent-first: on-screen "
                 "indicator, persistent notification and a user toggle, never covert.",
    },
    {
        "name": "Brownie Care",
        "tag": "AI Companion Health App",
        "stack": "Kotlin · Compose Canvas · Groq LLM · Convex · WorkManager",
        "link": None,
        "blurb": "Health companion built around a character drawn entirely in Compose Canvas with spring "
                 "animations — no image assets. DataStore is the source of truth with Convex as a best-effort "
                 "cloud mirror, so the app works fully offline.",
    },
    {
        "name": "Megatron",
        "tag": "Modular Adaptive AI Control System",
        "stack": "Python · FastAPI · JavaScript",
        "link": "github.com/D-A-R-X/Megatron",
        "blurb": "Modular AI controller with a central reasoning layer that analyses intent and delegates to "
                 "specialised modules — new capabilities added without rewriting core logic.",
    },
    {
        "name": "Smart Campus",
        "tag": "Academic Resource Management App",
        "stack": "Flutter · Firebase Auth · Firestore · Firebase Storage",
        "link": "Play Store — com.schrodingerlab.curiosity",
        "blurb": "Cross-platform app delivering centralised academic resources with offline download support. "
                 "Deployed to the Google Play Store.",
    },
    {
        "name": "Sentinel X",
        "tag": "Trading Automation · MetaTrader 5 & Indian MCX",
        "stack": "Python · MetaTrader 5 · Fyers API · Zerodha Kite Connect · Next.js · Convex · React Native",
        "link": None,
        "blurb": "Automated forex and gold trading on MetaTrader 5, with AI review of each setup, structural risk "
                 "rules and a desktop, web and phone control panel. An Indian build trades MCX futures through "
                 "Zerodha on live Fyers prices, with hard risk caps and live trading gated per account.",
    },
    {
        "name": "Drive Track Mate",
        "tag": "Intelligent Driving Monitoring",
        "stack": "Android · Dash Camera Integration · Event-Based Recording",
        "link": "github.com/D-A-R-X/drive-track-mate",
        "blurb": "Event-aware recording that auto-tags sudden braking and abrupt manoeuvres with timestamps and "
                 "metadata, replacing unstructured continuous footage with retrievable evidence.",
    },
]

EDUCATION = [
    {
        "degree": "B.E. Computer Science & Engineering",
        "school": "Dhanalakshmi Srinivasan College of Engineering",
        "place": "Coimbatore, Tamil Nadu",
        "when": "2022 — 2026",
        "score": "CGPA 7.43 / 10",
        "note": "Coursework in data structures, databases, computer networks, operating systems and machine "
                "learning, alongside production Android and full-stack work throughout the degree.",
    },
]

CERTS = [
    ("Oracle University", "OCI 2023 Certified Foundations Associate", "Issued Jun 2024"),
    ("NxtWave", "AI for Students: Build Your Own Generative AI Model", "Sep 2024"),
    ("Google Digital Unlocked", "Fundamentals of Digital Marketing", "Jan 2021"),
]

RECOGNITION = [
    "Published 'AI in Retail Marketing' — PSG College Conference.",
    "MSME Hackathon — Rathinam Institute of Technology.",
    "Presented at 3+ national hackathons.",
    "MERN Stack Workshop — CIT Coimbatore, Feb 2025.",
]

STUDIO = (
    "Cruza — co-founder of an independent software studio building intelligent systems, est. 2025. "
    "Flagship product: Mentorix, a live career-intelligence system."
)
