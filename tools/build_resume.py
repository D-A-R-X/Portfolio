"""Surya J — resume PDF.

Typographic system matches the portfolio: a gothic display face for the name and
headings, a humanist sans for body copy, a mono for labels and metadata. White
paper, one blue signal colour, hairline rules. No filled panels, no gradients.

Each column is laid out independently — blocks are measured first and emitted
per page — so the left column running onto page 2 never displaces the right.
"""
import sys
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

W, H = A4

# ── typefaces (embedded) ───────────────────────────────────
FONT_FILES = {
    "Display": "framd.ttf",        # Franklin Gothic Medium — name, headings
    "Body":    "segoeui.ttf",      # humanist sans — body copy
    "BodyB":   "segoeuib.ttf",
    "BodyL":   "segoeuisl.ttf",    # semilight — secondary copy
    "Mono":    "consola.ttf",      # labels, dates, metadata
    "MonoB":   "consolab.ttf",
}
for name, file in FONT_FILES.items():
    pdfmetrics.registerFont(TTFont(name, "C:/Windows/Fonts/" + file))

F_D, F_R, F_B, F_L, F_M, F_MB = "Display", "Body", "BodyB", "BodyL", "Mono", "MonoB"

# ── palette ────────────────────────────────────────────────
INK    = HexColor("#101318")   # near-black, matches the site's text
BODY   = HexColor("#3c424c")
MUTED  = HexColor("#6b7280")
FAINT  = HexColor("#9aa1ad")
RULE   = HexColor("#d9dde4")
HAIR   = HexColor("#eaedf1")
BLUE   = HexColor("#2c64ff")
BLUED  = HexColor("#1a4bcc")

HEADER_H = 112.0
FOOTER_H = 26.0
TOP_PAD  = 20.0
BOT_MARG = 42.0

L_X, L_W = 42.0, 318.0
R_X, R_W = 392.0, 161.0
DIV_X    = 374.0


def wrap(text, font, size, width):
    return simpleSplit(text, font, size, width)


def tracked(c, text, x, y, font, size, colour, space=1.0):
    """Letter-spaced uppercase label — the mono voice from the site.

    Canvas has no char-spacing setter in this reportlab, so go through a text
    object, which does.
    """
    t = c.beginText(x, y)
    t.setFont(font, size)
    t.setFillColor(colour)
    t.setCharSpace(space)
    t.textOut(text)
    # Tc is graphics state and survives ET — zero it or every later drawString
    # inherits the tracking and renders far wider than it was measured.
    t.setCharSpace(0)
    c.drawText(t)


def tracked_width(text, font, size, space=1.0):
    return pdfmetrics.stringWidth(text, font, size) + space * max(0, len(text) - 1)


class Column:
    """Places blocks top-to-bottom, spilling onto later pages when full."""

    def __init__(self, x, width, top, bottom):
        self.x, self.width = x, width
        self.top, self.bottom = top, bottom
        self.y = top
        self.page = 0
        self.ops = {}
        self.page_tops = {0: top}

    def _emit(self, fn):
        self.ops.setdefault(self.page, []).append(fn)

    def _newpage(self):
        self.page += 1
        self.y = self.page_tops.get(self.page, H - 58)

    def space(self, h):
        self.y -= h

    def need(self, h):
        if self.y - h < self.bottom:
            self._newpage()

    # ── measurement, for keep-together blocks ──────────────
    def m_para(self, text, size, lead, font=F_R, indent=0.0):
        return len(wrap(text, font, size, self.width - indent)) * lead

    def m_heading(self, text, size, font=F_D, lead=None):
        return len(wrap(text, font, size, self.width)) * (lead or size + 2.6)

    def m_meta(self, size=7.2):
        return size + 5.0

    def m_bullet(self, text, size=8.0, lead=10.6):
        return len(wrap(text, F_R, size, self.width - 10.0)) * lead

    # ── blocks ────────────────────────────────────────────
    def section(self, title, gap=15):
        self.space(gap)
        self.need(26)
        y = self.y
        self._emit(lambda c, y=y: self._draw_section(c, title, y))
        self.y = y - 15

    def _draw_section(self, c, title, y):
        tracked(c, title.upper(), self.x, y, F_MB, 6.4, BLUE, space=1.5)
        c.setStrokeColor(RULE)
        c.setLineWidth(0.7)
        lw = tracked_width(title.upper(), F_MB, 6.4, 1.5)
        c.line(self.x + lw + 8, y + 2, self.x + self.width, y + 2)

    def heading(self, text, size=10.0, colour=INK, font=F_D, gap=0, lead=None):
        lead = lead or size + 2.4
        self.space(gap)
        for ln in wrap(text, font, size, self.width):
            self.need(lead)
            y = self.y
            self._emit(lambda c, ln=ln, y=y: (c.setFont(font, size), c.setFillColor(colour), c.drawString(self.x, y, ln)))
            self.y -= lead

    def meta(self, left, right=None, size=7.2):
        self.need(size + 5)
        y = self.y

        def draw(c, y=y):
            c.setFont(F_M, size)
            c.setFillColor(MUTED)
            c.drawString(self.x, y, left)
            if right:
                tracked(c, right, self.x + self.width - tracked_width(right, F_MB, size, 0.6), y, F_MB, size, BLUE, space=0.6)

        self._emit(draw)
        self.y -= size + 5.0

    def para(self, text, size=8.1, colour=BODY, lead=11.0, gap=2.0, font=F_R, indent=0.0):
        self.space(gap)
        for ln in wrap(text, font, size, self.width - indent):
            self.need(lead)
            y = self.y
            self._emit(lambda c, ln=ln, y=y: (c.setFont(font, size), c.setFillColor(colour), c.drawString(self.x + indent, y, ln)))
            self.y -= lead

    def bullet(self, text, size=8.0, colour=BODY, lead=10.6, gap=1.8, marker=BLUE):
        self.space(gap)
        ind = 10.0
        lines = wrap(text, F_R, size, self.width - ind)
        for i, ln in enumerate(lines):
            self.need(lead)
            y = self.y

            def draw(c, ln=ln, y=y, first=(i == 0)):
                if first:
                    c.setFillColor(marker)
                    c.rect(self.x + 0.5, y + 2.2, 3.0, 3.0, stroke=0, fill=1)
                c.setFont(F_R, size)
                c.setFillColor(colour)
                c.drawString(self.x + ind, y, ln)

            self._emit(draw)
            self.y -= lead

    def field(self, label, value, size=7.7):
        """Mono label over value — the site's metadata-table pattern."""
        self.need(21)
        y = self.y
        self._emit(lambda c, y=y: tracked(c, label.upper(), self.x, y, F_M, 6.0, FAINT, space=1.1))
        self.y -= 9.6
        self.para(value, size=size, colour=BODY, lead=10.0, gap=0)
        self.y -= 3.4

    def hair(self, gap=5.0):
        self.space(gap)
        self.need(4)
        y = self.y
        self._emit(lambda c, y=y: (c.setStrokeColor(HAIR), c.setLineWidth(0.6), c.line(self.x, y, self.x + self.width, y)))
        self.y -= 4.0


# ── page furniture ─────────────────────────────────────────
def draw_header(c):
    c.setFont(F_D, 31)
    c.setFillColor(INK)
    c.drawString(L_X, H - 58, "Surya J")

    name_w = pdfmetrics.stringWidth("Surya J", F_D, 31)
    tracked(c, "APP & WEB DEVELOPER", L_X + name_w + 16, H - 58, F_MB, 7.4, BLUE, space=1.6)
    tracked(c, "AI SYSTEMS  ·  FULL-STACK APPLICATIONS", L_X + name_w + 16, H - 70, F_M, 7.0, MUTED, space=1.0)

    # contact strip
    c.setFont(F_M, 7.3)
    c.setFillColor(BODY)
    for txt, x in [
        ("surya777dbs@gmail.com", L_X),
        ("Madurai, Tamil Nadu, India", L_X + 146),
        ("github.com/D-A-R-X", L_X + 296),
        ("linkedin.com/in/surya-j-194910306", L_X + 404),
    ]:
        c.drawString(x, H - 90, txt)

    c.setFont(F_M, 6.6)
    c.setFillColor(FAINT)
    c.drawString(L_X, H - 101, "DOB 31 Aug 2004   ·   Tamil, English   ·   CGPA 7.43 / 10   ·   B.E. CSE 2022\u20132026")

    # single blue signal rule closing the header
    c.setFillColor(BLUE)
    c.rect(L_X, H - HEADER_H, 46, 1.8, stroke=0, fill=1)
    c.setStrokeColor(RULE)
    c.setLineWidth(0.7)
    c.line(L_X + 46, H - HEADER_H + 0.9, W - L_X, H - HEADER_H + 0.9)


def draw_continuation_header(c):
    c.setFont(F_D, 12)
    c.setFillColor(INK)
    c.drawString(L_X, H - 44, "Surya J")
    tracked(c, "APP & WEB DEVELOPER  ·  CONTINUED", L_X + 58, H - 44, F_M, 6.6, MUTED, space=1.2)
    c.setFillColor(BLUE)
    c.rect(L_X, H - 54, 46, 1.4, stroke=0, fill=1)
    c.setStrokeColor(RULE)
    c.setLineWidth(0.7)
    c.line(L_X + 46, H - 53.3, W - L_X, H - 53.3)


def draw_footer(c, page, total):
    c.setStrokeColor(HAIR)
    c.setLineWidth(0.6)
    c.line(L_X, FOOTER_H + 4, W - L_X, FOOTER_H + 4)
    c.setFont(F_M, 6.4)
    c.setFillColor(FAINT)
    c.drawString(L_X, 13, "surya777dbs@gmail.com   ·   github.com/D-A-R-X   ·   linkedin.com/in/surya-j-194910306")
    tracked(c, f"{page} / {total}", W - L_X - tracked_width(f"{page} / {total}", F_MB, 6.4, 0.8), 13, F_MB, 6.4, BLUE, space=0.8)


def draw_divider(c, top):
    c.setStrokeColor(HAIR)
    c.setLineWidth(0.7)
    c.line(DIV_X, FOOTER_H + 16, DIV_X, top)


# ── content ────────────────────────────────────────────────
def build_left(col):
    col.section("Profile", gap=0)
    col.para(
        "App and web developer building production Android and full-stack systems. Software developer at "
        "Kosal Tech Solutions, with a contract engagement at Manju Global \u2014 delivering Kotlin/Compose "
        "mobile apps, Next.js platforms, and the Go and Python services behind them. Computer Science "
        "Engineering student (2022\u20132026) focused on AI-powered applications and clean, maintainable "
        "architecture.",
        size=8.2, lead=11.4,
    )

    col.section("Experience")

    jobs = [
        {
            "role": "Software Developer", "org": "Kosal Tech Solutions", "when": "CURRENT",
            "points": [
                "Build internal tooling and client-facing web systems across the company's delivery work.",
                "Developed Kosal-Link, a four-tool scraper suite \u2014 static downloader, browser-based scraper for "
                "JS-heavy pages, structure extractor, and a CLI that renders a live landing page, detects section "
                "boundaries, and exports selector-scoped components as a reusable blueprint.",
            ],
        },
        {
            "role": "App & Web Developer \u00b7 Contract", "org": "Manju Global", "when": "CONTRACT",
            "points": [
                "Mconnect \u2014 Android client for the Manju Groups project-management system: OTP authentication, HR, "
                "attendance, leave and chat. Kotlin + MVVM + Retrofit, AES256-GCM encrypted session storage, and a "
                "semantic colour-token design system driving light and dark from one source.",
                "Manju PMS platform \u2014 Next.js + Convex operations platform covering land procurement, legal and "
                "feasibility gating, channel-partner management, Excel/PDF reporting and an AI sales assistant.",
                "Airix Geo Tracking \u2014 Go service for location ingestion, live tracking, trip sessions and tamper "
                "monitoring on PostgreSQL/PostGIS + TimescaleDB, with Redis for live state and idempotency.",
                "Travel Desk \u2014 Next.js trip allocation and fleet billing: token-scoped driver pages delivered over "
                "WhatsApp with no driver login, OCR on uploaded odometer evidence, and explicit extra-km, "
                "cancellation and offline-completion states.",
            ],
        },
        {
            "role": "MERN Stack Developer Intern", "org": "VEI Technologies", "when": "JAN\u2013FEB 2025",
            "points": [
                "Developed full-stack modules using MongoDB, Express.js, React and Node.js.",
                "Built and integrated REST APIs connecting frontend components with backend services across agile sprints.",
            ],
        },
        {
            "role": "Web Development Intern", "org": "NoviTech", "when": "JAN 2025",
            "points": [
                "Designed responsive web interfaces in HTML, CSS and JavaScript, integrating backend services and "
                "optimising page performance across multiple modules.",
            ],
        },
    ]

    for i, j in enumerate(jobs):
        head = col.m_heading(j["role"], 10.0) + col.m_meta() + col.m_bullet(j["points"][0]) + 8
        col.space(7 if i else 2)
        col.need(head)
        col.heading(j["role"], size=10.0)
        col.meta(j["org"], j["when"])
        for p in j["points"]:
            col.bullet(p)

    col.section("Selected Projects")

    projects = [
        ("Mentorix", "AI Career Intelligence System",
         "Python \u00b7 FastAPI \u00b7 RandomForest \u00b7 SQLite \u00b7 Vercel / Render",
         "github.com/D-A-R-X/mentorix-ai",
         "AI engine analysing student behaviour patterns to predict career instability and recommend personalised "
         "paths. Modular FastAPI REST services with a RandomForest model behind an explainable AI layer that returns "
         "reasoning, not just scores."),
        ("Darx Dialer", "Default Phone App with Cloud Recording",
         "Kotlin \u00b7 Jetpack Compose \u00b7 InCallService \u00b7 Convex",
         None,
         "Full default-dialer replacement implementing InCallService and the DIALER role \u2014 lock-screen incoming UI, "
         "Bluetooth routing, DTMF and hold. Per-call recording is consent-first: on-screen indicator, persistent "
         "notification and a user toggle, never covert."),
        ("Brownie Care", "AI Companion Health App",
         "Kotlin \u00b7 Compose Canvas \u00b7 Groq LLM \u00b7 Convex \u00b7 WorkManager",
         None,
         "Health companion built around a character drawn entirely in Compose Canvas with spring animations \u2014 no "
         "image assets. DataStore is the source of truth with Convex as a best-effort cloud mirror, so the app works "
         "fully offline."),
        ("Megatron", "Modular Adaptive AI Control System",
         "Python \u00b7 FastAPI \u00b7 JavaScript",
         "github.com/D-A-R-X/Megatron",
         "Modular AI controller with a central reasoning layer that analyses intent and delegates to specialised "
         "modules \u2014 new capabilities added without rewriting core logic."),
        ("Smart Campus", "Academic Resource Management App",
         "Flutter \u00b7 Firebase Auth \u00b7 Firestore \u00b7 Firebase Storage",
         "Play Store \u2014 com.schrodingerlab.curiosity",
         "Cross-platform app delivering centralised academic resources with offline download support. Deployed to the "
         "Google Play Store."),
        ("Drive Track Mate", "Intelligent Driving Monitoring",
         "Android \u00b7 Dash Camera Integration \u00b7 Event-Based Recording",
         "github.com/D-A-R-X/drive-track-mate",
         "Event-aware recording that auto-tags sudden braking and abrupt manoeuvres with timestamps and metadata, "
         "replacing unstructured continuous footage with retrievable evidence."),
        ("Fitcore", "AI-Based Fitness Tracking System \u2014 in progress",
         "Flutter \u00b7 Firebase Auth \u00b7 Firestore",
         None,
         "Adaptive fitness progression using verified activity data and experience-based levelling \u2014 progress "
         "calculated from validated signals, not user-controlled inputs."),
    ]

    for i, (name, tag, stack, link, blurb) in enumerate(projects):
        block = col.m_heading(name, 9.6) + 10 + col.m_meta() + col.m_para(blurb, 7.9, 10.4) + 20
        col.space(7 if i else 2)
        col.need(block)

        y = col.y
        def draw_title(c, y=y, name=name, tag=tag):
            c.setFont(F_D, 9.6)
            c.setFillColor(INK)
            c.drawString(col.x, y, name)
            nw = pdfmetrics.stringWidth(name, F_D, 9.6)
            c.setFont(F_L, 8.4)
            c.setFillColor(MUTED)
            c.drawString(col.x + nw + 7, y, "\u2014  " + tag)
        col._emit(draw_title)
        col.y -= 12.6

        # Right-align the link on the stack line only when it actually fits;
        # otherwise give it its own line rather than letting the two collide.
        stack_w = pdfmetrics.stringWidth(stack, F_M, 7.0)
        link_w = tracked_width(link, F_M, 6.8, 0.3) if link else 0
        inline = bool(link) and stack_w + link_w + 14 <= col.width

        col.meta(stack, None, size=7.0)
        if link and inline:
            y2 = col.y + 12.0
            col._emit(lambda c, y=y2, link=link, link_w=link_w: tracked(
                c, link, col.x + col.width - link_w, y, F_M, 6.8, BLUED, space=0.3))
        elif link:
            col.space(-1.5)
            y2 = col.y
            col._emit(lambda c, y=y2, link=link: tracked(c, link, col.x, y, F_M, 6.8, BLUED, space=0.3))
            col.y -= 10.0

        col.para(blurb, size=7.9, lead=10.4, gap=0.5)


def build_right(col):
    col.section("Education", gap=0)
    col.heading("B.E. Computer Science", size=9.4)
    col.space(2)
    col.para("Dhanalakshmi Srinivasan College of Engineering", size=7.6, colour=BODY, lead=9.8)
    col.para("Coimbatore, Tamil Nadu", size=7.6, colour=MUTED, lead=9.8)
    col.space(1)
    y = col.y
    col._emit(lambda c, y=y: (
        tracked(c, "2022 \u2014 2026", col.x, y, F_M, 7.0, MUTED, space=0.6),
        tracked(c, "CGPA 7.43 / 10", col.x + col.width - tracked_width("CGPA 7.43 / 10", F_MB, 7.0, 0.6), y, F_MB, 7.0, BLUE, space=0.6),
    ))
    col.y -= 11.0

    col.section("Technical Skills")
    for label, value in [
        ("Languages",  "Python, JavaScript, TypeScript, Kotlin, Dart, Go"),
        ("Frameworks", "React, Next.js, FastAPI, Jetpack Compose, Flutter, Node.js"),
        ("Mobile",     "Android (Kotlin / Compose), Material 3, Flutter"),
        ("Backend",    "Convex, Firebase, REST APIs"),
        ("Data",       "PostgreSQL / PostGIS, TimescaleDB, SQLite, Firestore"),
        ("AI / ML",    "Machine Learning, Generative AI, Prompt Engineering"),
        ("Tooling",    "Git, GitHub, Docker, VS Code, Cursor"),
        ("Deployment", "Vercel, Render"),
    ]:
        col.field(label, value)

    col.section("Certifications")
    for i, (issuer, name, when) in enumerate([
        ("Oracle University", "OCI 2023 Certified Foundations Associate", "Jun 2024 \u2013 Jun 2026"),
        ("NxtWave", "AI for Students: Build Your Own Generative AI Model", "Sep 2024"),
        ("Google Digital Unlocked", "Fundamentals of Digital Marketing", "Jan 2021  \u00b7  ID 6A5 5B9 RR5"),
    ]):
        col.space(4 if i else 0)
        col.need(30)
        y = col.y
        col._emit(lambda c, y=y, issuer=issuer: tracked(c, issuer.upper(), col.x, y, F_M, 6.0, FAINT, space=1.1))
        col.y -= 9.6
        col.para(name, size=7.7, colour=BODY, lead=9.8, gap=0)
        col.para(when, size=6.9, colour=MUTED, lead=9.0, gap=0.6, font=F_M)

    col.section("Recognition")
    for a in [
        "Published 'AI in Retail Marketing' \u2014 PSG College Conference",
        "MSME Hackathon \u2014 Rathinam Institute of Technology",
        "3+ National Hackathon presentations",
        "MERN Stack Workshop \u2014 CIT Coimbatore, Feb 2025",
    ]:
        col.bullet(a, size=7.5, lead=9.8, gap=1.6)

    col.section("Interests")
    col.para(
        "AI systems & applications, backend architecture, Android development, geospatial systems, "
        "AI product development, full-stack engineering.",
        size=7.5, colour=BODY, lead=9.8, gap=0,
    )

    col.section("Also")
    col.heading("Cruza", size=9.0)
    col.space(1)
    col.para("Co-founder \u00b7 independent software studio building intelligent systems. Est. 2025.",
             size=7.5, colour=BODY, lead=9.8, gap=1)


def main(out_path):
    top = H - HEADER_H - TOP_PAD
    cont_top = H - 74.0
    bottom = FOOTER_H + BOT_MARG

    left = Column(L_X, L_W, top, bottom)
    right = Column(R_X, R_W, top, bottom)
    for col in (left, right):
        for p in range(1, 6):
            col.page_tops[p] = cont_top

    build_left(left)
    build_right(right)

    total = max(max(left.ops, default=0), max(right.ops, default=0)) + 1

    c = pdfcanvas.Canvas(out_path, pagesize=A4)
    c.setTitle("Surya J \u2014 Resume")
    c.setAuthor("Surya J")
    c.setSubject("App & Web Developer | AI Systems | Full-Stack Applications")

    for page in range(total):
        if page == 0:
            draw_header(c)
            div_top = H - HEADER_H - 14
        else:
            draw_continuation_header(c)
            div_top = H - 68

        if right.ops.get(page):
            draw_divider(c, div_top)
        for fn in left.ops.get(page, []):
            fn(c)
        for fn in right.ops.get(page, []):
            fn(c)
        draw_footer(c, page + 1, total)
        c.showPage()

    c.save()
    print(f"wrote {out_path} \u2014 {total} page(s)")
    print(f"left ends p{max(left.ops)+1}, right ends p{max(right.ops)+1}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "Surya_J_Resume.pdf")
