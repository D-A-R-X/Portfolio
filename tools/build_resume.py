"""Surya J — resume PDF.

Single column, reverse-chronological, ATS-first.

Why single column: applicant tracking systems read a PDF in the order its text
was drawn. A two-column layout interleaves the two streams, so a sidebar skill
list can land in the middle of a job description. One column keeps the reading
order the same for a parser and for a person.

Everything a parser needs is real text — no tables, no text boxes, no images,
no icon glyphs, standard section headings. The design is carried by type,
spacing and hairline rules, which are vector marks a parser never sees.

Typography matches the portfolio: a gothic display face for the name and
headings, a humanist sans for body copy, a mono for labels and metadata.
"""
import sys
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from resume_content import (
    NAME, TITLE, TAGLINE, CONTACT, PROFILE, SKILLS, JOBS, PROJECTS,
    EDUCATION, CERTS, RECOGNITION, STUDIO,
)

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
INK    = HexColor("#101318")
BODY   = HexColor("#3c424c")
MUTED  = HexColor("#6b7280")
FAINT  = HexColor("#9aa1ad")
RULE   = HexColor("#d9dde4")
HAIR   = HexColor("#eaedf1")
BLUE   = HexColor("#2c64ff")
BLUED  = HexColor("#1a4bcc")

MARGIN   = 46.0
COL_W    = W - MARGIN * 2
HEADER_H = 104.0
CONT_H   = 52.0
FOOTER_H = 30.0
BOT_MARG = 14.0
LABEL_W  = 74.0          # hanging indent for the skills block


def wrap(text, font, size, width):
    return simpleSplit(text, font, size, width)


def tracked(c, text, x, y, font, size, colour, space=1.0):
    """Letter-spaced label — the mono voice from the site.

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


class Flow:
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
        self.y = self.page_tops.get(self.page, H - CONT_H - 16)

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

    def m_bullet(self, text, size=8.3, lead=11.0):
        return len(wrap(text, F_R, size, self.width - 11.0)) * lead

    # ── blocks ────────────────────────────────────────────
    def section(self, title, gap=16):
        """A heading a parser reads as a standard section name."""
        self.space(gap)
        self.need(30)
        y = self.y
        self._emit(lambda c, y=y: self._draw_section(c, title, y))
        self.y = y - 16

    def _draw_section(self, c, title, y):
        tracked(c, title.upper(), self.x, y, F_MB, 7.0, BLUE, space=1.6)
        lw = tracked_width(title.upper(), F_MB, 7.0, 1.6)
        c.setStrokeColor(RULE)
        c.setLineWidth(0.7)
        c.line(self.x + lw + 9, y + 2.4, self.x + self.width, y + 2.4)

    def entry(self, title, org, when, title_size=10.4):
        """Role or degree: strong title, organisation, right-aligned dates."""
        self.need(title_size + 16)
        y = self.y

        def draw(c, y=y):
            c.setFont(F_D, title_size)
            c.setFillColor(INK)
            c.drawString(self.x, y, title)
            if when:
                tw = tracked_width(when, F_MB, 7.2, 0.7)
                tracked(c, when, self.x + self.width - tw, y + 0.6, F_MB, 7.2, BLUE, space=0.7)

        self._emit(draw)
        self.y -= title_size + 2.6
        if org:
            y2 = self.y
            self._emit(lambda c, y=y2: (
                c.setFont(F_B, 8.3), c.setFillColor(BLUED), c.drawString(self.x, y, org)))
            self.y -= 11.4

    def para(self, text, size=8.4, colour=BODY, lead=11.4, gap=2.0, font=F_R, indent=0.0):
        self.space(gap)
        for ln in wrap(text, font, size, self.width - indent):
            self.need(lead)
            y = self.y
            self._emit(lambda c, ln=ln, y=y: (
                c.setFont(font, size), c.setFillColor(colour), c.drawString(self.x + indent, y, ln)))
            self.y -= lead

    def bullet(self, text, size=8.3, colour=BODY, lead=11.0, gap=2.2, marker=BLUE):
        self.space(gap)
        ind = 11.0
        lines = wrap(text, F_R, size, self.width - ind)
        for i, ln in enumerate(lines):
            self.need(lead)
            y = self.y

            def draw(c, ln=ln, y=y, first=(i == 0)):
                if first:
                    c.setFillColor(marker)
                    c.rect(self.x + 0.5, y + 2.4, 3.2, 3.2, stroke=0, fill=1)
                c.setFont(F_R, size)
                c.setFillColor(colour)
                c.drawString(self.x + ind, y, ln)

            self._emit(draw)
            self.y -= lead

    def label_value(self, label, value, size=8.2, lead=11.0):
        """Mono label with the value hanging beside it — the skills block."""
        lines = wrap(value, F_R, size, self.width - LABEL_W)
        self.need(len(lines) * lead)
        y = self.y
        self._emit(lambda c, y=y: tracked(c, label.upper(), self.x, y, F_M, 6.6, MUTED, space=1.1))
        for i, ln in enumerate(lines):
            yy = self.y
            self._emit(lambda c, ln=ln, y=yy: (
                c.setFont(F_R, size), c.setFillColor(BODY), c.drawString(self.x + LABEL_W, y, ln)))
            self.y -= lead
        self.y -= 2.0

    def meta(self, text, right=None, size=7.3, colour=MUTED, gap=0.0):
        self.space(gap)
        self.need(size + 5)
        y = self.y

        def draw(c, y=y):
            c.setFont(F_M, size)
            c.setFillColor(colour)
            c.drawString(self.x, y, text)
            if right:
                tracked(c, right, self.x + self.width - tracked_width(right, F_M, size, 0.3),
                        y, F_M, size, BLUED, space=0.3)

        self._emit(draw)
        self.y -= size + 5.0

    def hair(self, gap=6.0):
        self.space(gap)
        self.need(4)
        y = self.y
        self._emit(lambda c, y=y: (
            c.setStrokeColor(HAIR), c.setLineWidth(0.6), c.line(self.x, y, self.x + self.width, y)))
        self.y -= 4.0


# ── page furniture ─────────────────────────────────────────
def draw_header(c):
    c.setFont(F_D, 30)
    c.setFillColor(INK)
    c.drawString(MARGIN, H - 56, NAME)

    name_w = pdfmetrics.stringWidth(NAME, F_D, 30)
    tracked(c, TITLE.upper(), MARGIN + name_w + 16, H - 56, F_MB, 7.6, BLUE, space=1.6)
    tracked(c, TAGLINE.upper(), MARGIN + name_w + 16, H - 68, F_M, 6.9, MUTED, space=1.0)

    # contact details as one plain text line, in the order a parser expects
    c.setFont(F_M, 7.4)
    c.setFillColor(BODY)
    c.drawString(MARGIN, H - 86, "   ·   ".join(CONTACT))

    c.setFillColor(BLUE)
    c.rect(MARGIN, H - HEADER_H, 46, 1.8, stroke=0, fill=1)
    c.setStrokeColor(RULE)
    c.setLineWidth(0.7)
    c.line(MARGIN + 46, H - HEADER_H + 0.9, W - MARGIN, H - HEADER_H + 0.9)


def draw_continuation_header(c):
    c.setFont(F_D, 12)
    c.setFillColor(INK)
    c.drawString(MARGIN, H - 42, NAME)
    tracked(c, f"{TITLE.upper()}  ·  CONTINUED", MARGIN + pdfmetrics.stringWidth(NAME, F_D, 12) + 12,
            H - 42, F_M, 6.6, MUTED, space=1.2)
    c.setFillColor(BLUE)
    c.rect(MARGIN, H - CONT_H, 46, 1.4, stroke=0, fill=1)
    c.setStrokeColor(RULE)
    c.setLineWidth(0.7)
    c.line(MARGIN + 46, H - CONT_H + 0.7, W - MARGIN, H - CONT_H + 0.7)


def draw_footer(c, page, total):
    c.setStrokeColor(HAIR)
    c.setLineWidth(0.6)
    c.line(MARGIN, FOOTER_H + 4, W - MARGIN, FOOTER_H + 4)
    c.setFont(F_M, 6.6)
    c.setFillColor(FAINT)
    c.drawString(MARGIN, 15, "   ·   ".join(CONTACT[:1] + CONTACT[2:4]))
    label = f"{page} / {total}"
    tracked(c, label, W - MARGIN - tracked_width(label, F_MB, 6.6, 0.8), 15, F_MB, 6.6, BLUE, space=0.8)


# ── content ────────────────────────────────────────────────
def build(f):
    f.section("Summary", gap=0)
    f.para(PROFILE, size=8.5, lead=11.8)

    f.section("Technical Skills")
    for label, value in SKILLS:
        f.label_value(label, value)

    f.section("Experience")
    for i, j in enumerate(JOBS):
        # keep the role, employer and first bullet together across a page break
        f.space(9 if i else 1)
        f.need(f.m_heading(j["role"], 10.4) + 14 + f.m_bullet(j["points"][0]) + 8)
        f.entry(j["role"], j["org"], j["when"])
        for p in j["points"]:
            f.bullet(p)

    f.section("Projects")
    for i, p in enumerate(PROJECTS):
        f.space(8 if i else 1)
        f.need(24 + f.m_para(p["blurb"], 8.2, 10.8) + 12)

        y = f.y
        name, tag = p["name"], p["tag"]

        def draw_title(c, y=y, name=name, tag=tag):
            c.setFont(F_D, 9.8)
            c.setFillColor(INK)
            c.drawString(f.x, y, name)
            nw = pdfmetrics.stringWidth(name, F_D, 9.8)
            c.setFont(F_L, 8.5)
            c.setFillColor(MUTED)
            c.drawString(f.x + nw + 7, y, "\u2014  " + tag)

        f._emit(draw_title)
        f.y -= 12.8

        # the link shares the stack line when it fits, else takes its own
        stack_w = pdfmetrics.stringWidth(p["stack"], F_M, 7.2)
        link = p.get("link")
        link_w = tracked_width(link, F_M, 7.0, 0.3) if link else 0
        inline = bool(link) and stack_w + link_w + 16 <= f.width

        f.meta(p["stack"], link if inline else None, size=7.2)
        if link and not inline:
            f.space(-2.0)
            y2 = f.y
            f._emit(lambda c, y=y2, link=link: tracked(c, link, f.x, y, F_M, 7.0, BLUED, space=0.3))
            f.y -= 10.4

        f.para(p["blurb"], size=8.2, lead=10.8, gap=0.5)

    f.section("Education")
    for e in EDUCATION:
        f.entry(e["degree"], e["school"], e["when"], title_size=10.0)
        f.meta(e["place"], e["score"], size=7.3)
        if e.get("note"):
            f.para(e["note"], size=8.2, lead=10.8, gap=0.5)

    f.section("Certifications")
    for issuer, name, when in CERTS:
        f.need(13)
        y = f.y

        def draw(c, y=y, name=name, issuer=issuer, when=when):
            c.setFont(F_R, 8.3)
            c.setFillColor(BODY)
            c.drawString(f.x, y, name)
            nw = pdfmetrics.stringWidth(name, F_R, 8.3)
            c.setFont(F_L, 8.0)
            c.setFillColor(MUTED)
            c.drawString(f.x + nw + 6, y, "\u00b7  " + issuer)
            tw = tracked_width(when, F_M, 7.0, 0.4)
            tracked(c, when, f.x + f.width - tw, y, F_M, 7.0, MUTED, space=0.4)

        f._emit(draw)
        f.y -= 12.8

    f.section("Recognition")
    for a in RECOGNITION:
        f.bullet(a, size=8.2, lead=10.8, gap=1.8)

    f.section("Also")
    f.para(STUDIO, size=8.2, lead=10.8, gap=0)


def main(out_path):
    top = H - HEADER_H - 20.0
    bottom = FOOTER_H + BOT_MARG

    f = Flow(MARGIN, COL_W, top, bottom)
    for p in range(1, 8):
        f.page_tops[p] = H - CONT_H - 18.0

    build(f)
    total = max(f.ops, default=0) + 1

    c = pdfcanvas.Canvas(out_path, pagesize=A4)
    c.setTitle(f"{NAME} \u2014 Resume")
    c.setAuthor(NAME)
    c.setSubject(f"{TITLE} | {TAGLINE}")

    for page in range(total):
        draw_header(c) if page == 0 else draw_continuation_header(c)
        for fn in f.ops.get(page, []):
            fn(c)
        draw_footer(c, page + 1, total)
        c.showPage()

    c.save()
    print(f"wrote {out_path} \u2014 {total} page(s)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "Surya_J_Resume.pdf")
