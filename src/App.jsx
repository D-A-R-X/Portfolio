import { useState, useEffect, useRef } from "react";

const NAV_LINKS = ["About", "Skills", "Projects", "Philosophy", "Contact"];

const CONTACT_LINKS = [
  { label: "Email", value: "surya777dbs@gmail.com", href: "mailto:surya777dbs@gmail.com" },
  { label: "WhatsApp", value: "WhatsApp", href: "https://wa.me/qr/U4KOUOEM4BFXA1" },
  { label: "Instagram", value: "@itz._darx._", href: "https://www.instagram.com/itz._darx._?igsh=ajJweWQ5eDU2N2I3" },
  { label: "LinkedIn", value: "Surya J", href: "https://www.linkedin.com/in/surya-j-194910306" },
];

const SKILL_BARS = [
  { name: "Python", level: 85, cat: "Language" },
  { name: "Frontend", level: 78, cat: "Language" },
  { name: "JavaScript", level: 63, cat: "Language" },
  { name: "FastAPI", level: 66, cat: "Framework" },
  { name: "Flutter", level: 57, cat: "Framework" },
  { name: "Firebase", level: 70, cat: "Framework" },
  { name: "Vibe Coding", level: 97, cat: "Approach" },
  { name: "Prompt Engineering", level: 98, cat: "AI / GenAI" },
  { name: "Generative AI", level: 88, cat: "AI / GenAI" },
  { name: "Machine Learning", level: 60, cat: "AI / GenAI" },
  { name: "REST APIs", level: 64, cat: "Backend" },
  { name: "Vercel · Render", level: 76, cat: "Deployment" },
  { name: "Editing", level: 71, cat: "Media" },
];

const PROJECTS = [
  {
    id: "01", name: "Mentorix", tag: "Behavioral Career Intelligence Engine",
    problem: "Students receive generic career advice that ignores behavioral patterns and decision history.",
    stack: ["Python", "FastAPI", "RandomForest", "SQLite", "HTML/CSS/JS"],
    power: "A behavioral AI engine that analyzes academic and decision patterns to predict career instability.",
    highlight: "Stability Index via momentum tracking, volatility detection, and track-flip analysis across sessions.",
    repo: "https://github.com/D-A-R-X/mentorix-ai", repoLabel: "GitHub",
  },
  {
    id: "02", name: "Megatron", tag: "Modular Adaptive AI Control System",
    problem: "Single-purpose AI systems lack modularity, making them brittle and hard to scale.",
    stack: ["Python", "FastAPI", "HTML", "CSS", "JavaScript"],
    power: "A modular AI controller that delegates tasks across specialized modules using centralized reasoning.",
    highlight: "Central reasoning layer routes intent to isolated modules — structured output without core coupling.",
    repo: "https://github.com/D-A-R-X/Megatron", repoLabel: "GitHub",
  },
  {
    id: "03", name: "Smart Campus", tag: "Academic Resource Management System",
    problem: "Academic resources are fragmented across platforms, creating friction in access.",
    stack: ["Flutter", "Firebase Auth", "Firestore", "Firebase Storage"],
    power: "A centralized mobile platform that securely delivers academic resources with offline accessibility.",
    highlight: "Cloud-native architecture with local download — access continuity regardless of connectivity.",
    repo: "https://play.google.com/store/apps/details?id=com.schrodingerlab.curiosity", repoLabel: "Play Store",
  },
  {
    id: "04", name: "Fitcore", tag: "AI-Based Fitness Tracking System",
    problem: "Most fitness apps rely on manual input, enabling data manipulation and inaccurate metrics.",
    stack: ["Flutter", "Firebase Auth", "Firestore"],
    power: "A fitness tracking system with adaptive logic ensuring accurate, cheat-resistant progress tracking.",
    highlight: "Dynamic experience-based leveling calculated from verified activity data, not self-reported figures.",
    repo: null, repoLabel: "In Progress",
  },
  {
    id: "05", name: "Drive Track Mate", tag: "Intelligent Driving Monitoring System",
    problem: "Passive dash cameras record without context, making critical event retrieval slow.",
    stack: ["Android Interface", "Dash Camera Integration", "Event-Based Recording"],
    power: "An intelligent driving monitor that captures and contextualizes critical events for safety.",
    highlight: "Event-aware recording auto-tags sudden braking and abrupt maneuvers with contextual metadata.",
    repo: "https://github.com/D-A-R-X/drive-track-mate", repoLabel: "GitHub",
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

function FadeIn({ children, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

function SkillBar({ name, level, cat, delay }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div ref={ref} style={{ marginBottom: "1.4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.45rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.9rem", color: "#ddd", fontWeight: 300 }}>{name}</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.52rem", color: "#E31B1B", letterSpacing: "0.1em", textTransform: "uppercase", border: "1px solid #222", padding: "0.1rem 0.4rem" }}>{cat}</span>
        </div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", color: "#444" }}>{level}%</span>
      </div>
      <div style={{ height: "2px", background: "#111", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: "2px",
          background: "linear-gradient(90deg, #E31B1B, #ff5555)",
          width: inView ? `${level}%` : "0%",
          transition: `width 1s ease ${delay}s`,
        }} />
      </div>
    </div>
  );
}

function ProjectCard({ project, mobile }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: "1px solid #1e1e1e" }}>
      <div onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: mobile ? "1.4rem 0" : "2rem 0", gap: "1rem", cursor: "pointer",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#E31B1B", flexShrink: 0 }}>{project.id}</span>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: mobile ? "1.05rem" : "clamp(1.2rem,3vw,1.6rem)", fontWeight: 700, color: "#fff", margin: 0 }}>{project.name}</h3>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", color: "#555", margin: "0.25rem 0 0", letterSpacing: "0.04em", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.tag}</p>
          </div>
        </div>
        <div style={{
          width: "24px", height: "24px", border: "1px solid #2a2a2a", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: open ? "#E31B1B" : "#555", fontSize: "1rem", flexShrink: 0,
          transition: "transform 0.3s, color 0.3s",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
        }}>+</div>
      </div>
      <div style={{ overflow: "hidden", maxHeight: open ? "900px" : "0", transition: "max-height 0.5s ease" }}>
        <div style={{ paddingBottom: "2rem", display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: "1.5rem" }}>
          {[["Problem", project.problem], ["Key Design", project.highlight]].map(([label, text]) => (
            <div key={label}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", color: "#E31B1B", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>{label}</p>
              <p style={{ color: "#888", fontSize: "0.87rem", lineHeight: 1.75, margin: 0 }}>{text}</p>
            </div>
          ))}
          <div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", color: "#E31B1B", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Stack</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {project.stack.map(s => (
                <span key={s} style={{ border: "1px solid #222", padding: "0.2rem 0.5rem", fontSize: "0.68rem", color: "#bbb", fontFamily: "'DM Mono', monospace" }}>{s}</span>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", color: "#E31B1B", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Output</p>
            <p style={{ color: "#ccc", fontSize: "0.85rem", lineHeight: 1.75, margin: 0, fontStyle: "italic" }}>{project.power}</p>
          </div>
          <div style={{ gridColumn: mobile ? "1" : "1 / -1" }}>
            {project.repo ? (
              <a href={project.repo} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", border: "1px solid #E31B1B", padding: "0.45rem 1rem", color: "#E31B1B", fontFamily: "'DM Mono', monospace", fontSize: "0.67rem", letterSpacing: "0.1em", textDecoration: "none", transition: "background 0.2s, color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#E31B1B"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#E31B1B"; }}
              >↗ {project.repoLabel}</a>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", border: "1px solid #222", padding: "0.45rem 1rem", color: "#444", fontFamily: "'DM Mono', monospace", fontSize: "0.67rem", letterSpacing: "0.1em" }}>◌ {project.repoLabel}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TechPiratesSection({ mobile }) {
  const [ref, inView] = useInView(0.2);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 600);
    return () => clearInterval(id);
  }, []);
  const dots = ".".repeat((tick % 3) + 1).padEnd(3, "\u00a0");

  return (
    <section style={{ padding: mobile ? "5rem 1.5rem" : "8rem 4rem", background: "#050505", borderTop: "1px solid #111", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 70% 50%, rgba(227,27,27,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div ref={ref} style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.7s, transform 0.7s", display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "4rem" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", letterSpacing: "0.2em", textTransform: "uppercase" }}>Venture</div>
          <div style={{ flex: 1, height: "1px", background: "#1a1a1a" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? "3rem" : "6rem", alignItems: "center" }}>
          <div style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(30px)", transition: "opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", border: "1px solid #2a2a2a", padding: "0.4rem 1rem", marginBottom: "2rem", background: "#0d0d0d" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#E31B1B", boxShadow: "0 0 6px #E31B1B", animation: "blink 1.2s ease-in-out infinite" }} />
              <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}`}</style>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", color: "#888", letterSpacing: "0.12em", textTransform: "uppercase" }}>Stealth Mode · Building{dots}</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: mobile ? "3.2rem" : "clamp(3rem,7vw,6rem)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.02em", marginBottom: "1.5rem" }}>
              Tech<span style={{ color: "#E31B1B" }}>Pirates</span>
            </h2>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "#666", fontStyle: "italic", fontWeight: 300, lineHeight: 1.6 }}>
              A dev agency & freelance studio — currently in formation.
            </p>
          </div>
          <div style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(30px)", transition: "opacity 0.8s ease 0.25s, transform 0.8s ease 0.25s" }}>
            <div style={{ border: "1px solid #1a1a1a", padding: mobile ? "1.8rem" : "3rem", background: "#080808" }}>
              {[
                { label: "Studio Type", value: "Dev Agency · Freelance Studio" },
                { label: "Status", value: null },
                { label: "Focus", value: null },
                { label: "Est.", value: "TBD" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", borderBottom: "1px solid #111" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#444", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
                  {value ? (
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.9rem", color: "#888" }}>{value}</span>
                  ) : (
                    <span style={{ display: "inline-block", width: "90px", height: "9px", background: "repeating-linear-gradient(90deg,#1e1e1e 0,#1e1e1e 8px,#111 8px,#111 10px)", borderRadius: "2px" }} />
                  )}
                </div>
              ))}
              <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.8rem" }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#E31B1B", flexShrink: 0 }}>!</span>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#444", lineHeight: 1.8 }}>Details withheld until launch.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Portfolio() {
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorHover, setCursorHover] = useState(false);
  const mobile = useIsMobile();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobile) return;
    const move = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mobile]);

  useEffect(() => {
    if (mobile) return;
    const links = document.querySelectorAll("a, button");
    const on = () => setCursorHover(true);
    const off = () => setCursorHover(false);
    links.forEach(l => { l.addEventListener("mouseenter", on); l.addEventListener("mouseleave", off); });
    return () => links.forEach(l => { l.removeEventListener("mouseenter", on); l.removeEventListener("mouseleave", off); });
  }, [mobile]);

  const scrollTo = (id) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    setNavOpen(false);
  };

  const pad = mobile ? "1.5rem" : "4rem";

  return (
    <div style={{ background: "#0a0a0a", color: "#fff", minHeight: "100vh", fontFamily: "'Cormorant Garamond', serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Mono:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        ::selection{background:#E31B1B;color:#fff;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:#0a0a0a;}
        ::-webkit-scrollbar-thumb{background:#E31B1B;}
        body{cursor:none;}
        @media(max-width:768px){body{cursor:auto;}}
        @keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Cursor — desktop only */}
      {!mobile && (
        <div style={{
          position: "fixed", top: 0, left: 0, zIndex: 9999, pointerEvents: "none",
          transform: `translate(${cursorPos.x - (cursorHover ? 20 : 6)}px, ${cursorPos.y - (cursorHover ? 20 : 6)}px)`,
          width: cursorHover ? "40px" : "12px", height: cursorHover ? "40px" : "12px",
          border: cursorHover ? "1.5px solid #E31B1B" : "none",
          background: cursorHover ? "transparent" : "#E31B1B",
          borderRadius: "50%",
          transition: "width 0.25s, height 0.25s, transform 0.06s linear",
        }} />
      )}

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: mobile ? "1.2rem 1.5rem" : "1.5rem 4rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled || navOpen ? "rgba(10,10,10,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #1a1a1a" : "none",
        transition: "all 0.4s ease",
      }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", letterSpacing: "0.15em", color: "#E31B1B" }}>DARX</div>
        {mobile ? (
          <button onClick={() => setNavOpen(!navOpen)} style={{ background: "none", border: "none", color: "#fff", fontSize: "1.3rem", cursor: "pointer", lineHeight: 1 }}>
            {navOpen ? "✕" : "☰"}
          </button>
        ) : (
          <div style={{ display: "flex", gap: "2.5rem" }}>
            {NAV_LINKS.map(l => (
              <button key={l} onClick={() => scrollTo(l)}
                style={{ background: "none", border: "none", color: "#888", fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: 0, cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#fff"}
                onMouseLeave={e => e.target.style.color = "#888"}
              >{l}</button>
            ))}
          </div>
        )}
      </nav>

      {/* Mobile menu */}
      {mobile && navOpen && (
        <div style={{ position: "fixed", top: "56px", left: 0, right: 0, zIndex: 999, background: "rgba(10,10,10,0.98)", borderBottom: "1px solid #1a1a1a", padding: "1rem 1.5rem 1.5rem", animation: "fadeSlide 0.2s ease" }}>
          {NAV_LINKS.map(l => (
            <button key={l} onClick={() => scrollTo(l)}
              style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", color: "#888", fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.9rem 0", borderBottom: "1px solid #111", cursor: "pointer" }}
            >{l}</button>
          ))}
        </div>
      )}

      {/* ── HERO ── */}
      <section id="about" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: mobile ? "0 1.5rem 4rem" : "0 4rem 6rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0, backgroundImage: "linear-gradient(rgba(227,27,27,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(227,27,27,0.04) 1px,transparent 1px)", backgroundSize: "80px 80px" }} />
        {!mobile && <div style={{ position: "absolute", top: "20%", right: "8%", width: "1px", height: "200px", background: "linear-gradient(transparent,#E31B1B,transparent)" }} />}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1.2rem" }}>
            — CSE Student · 2022–2026
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: mobile ? "clamp(3.5rem,18vw,5.5rem)" : "clamp(4rem,10vw,9rem)", fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: "1.8rem" }}>
            Surya J<span style={{ color: "#E31B1B" }}>.</span>
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.8rem" }}>
            {["Vibe Coder", "AI Systems Builder", "Web App Developer", "Prompt Engineer"].map(tag => (
              <span key={tag} style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#E31B1B", border: "1px solid #2a2a2a", padding: "0.28rem 0.65rem", letterSpacing: "0.08em", background: "rgba(227,27,27,0.04)" }}>{tag}</span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: mobile ? "flex-start" : "flex-end", justifyContent: "space-between", flexDirection: mobile ? "column" : "row", gap: "1.5rem" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: mobile ? "1.05rem" : "clamp(1.1rem,2.5vw,1.4rem)", fontWeight: 300, color: "#888", maxWidth: "540px", lineHeight: 1.65, fontStyle: "italic" }}>
              Building intelligent software systems and web applications — powered by AI tools, vibe coding, and a strong sense of what actually needs to be built.
            </p>
            {!mobile && (
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#444", lineHeight: 2, textAlign: "right" }}>
                <div>Madurai, Tamil Nadu</div>
                <div>India · D-A-R-X</div>
              </div>
            )}
          </div>
        </div>
        <div style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "1px", height: "44px", background: "linear-gradient(transparent,#E31B1B)", animation: "pulse 2s ease-in-out infinite" }} />
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section style={{ padding: mobile ? "5rem 1.5rem" : "8rem 4rem", borderTop: "1px solid #111" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.7rem" }}>About</div>
            <div style={{ width: "40px", height: "1px", background: "#E31B1B", marginBottom: "2.5rem" }} />
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? "2.5rem" : "5rem" }}>
            <FadeIn delay={0.1}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: mobile ? "1.75rem" : "clamp(1.8rem,4vw,2.8rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: "1.8rem" }}>
                Systems thinker.<br /><span style={{ color: "#E31B1B", fontStyle: "italic" }}>Intelligence architect.</span>
              </h2>
              <p style={{ fontSize: "1rem", color: "#888", lineHeight: 1.9, marginBottom: "1.2rem", fontWeight: 300 }}>
                I'm a Computer Science Engineering student at Dhanalakshmi Srinivasan College of Engineering, Coimbatore, graduating in 2026. My work sits at the intersection of backend systems, applied machine learning, and behavioral data analysis.
              </p>
              <p style={{ fontSize: "1rem", color: "#888", lineHeight: 1.9, fontWeight: 300 }}>
                I build web applications and AI systems using a vibe coding approach — leveraging AI tools and prompt engineering to ship faster and smarter. I focus on architecture and outcomes, using the best available tools to get there without unnecessary friction.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div style={{ border: "1px solid #1e1e1e", padding: "1.8rem", background: "#080808", marginBottom: "1.5rem" }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", color: "#E31B1B", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>How I build</div>
                <p style={{ fontSize: "0.93rem", color: "#999", lineHeight: 1.8, fontWeight: 300 }}>
                  I use AI tools — Cursor, Claude, ChatGPT, GitHub Copilot — as force multipliers. A clear problem definition + the right prompt + solid architectural thinking = production-grade software, faster. This is vibe coding done right.
                </p>
                <div style={{ marginTop: "1.2rem", display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {["Cursor", "Claude", "ChatGPT", "Copilot", "v0"].map(t => (
                    <span key={t} style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", color: "#555", border: "1px solid #1e1e1e", padding: "0.15rem 0.45rem" }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                {[
                  ["BE · CSE", "Dhanalakshmi Srinivasan"],
                  ["2022 – 2026", "Expected Graduation"],
                  ["Madurai, TN", "Native"],
                  ["D-A-R-X", "GitHub Handle"],
                ].map(([v, l]) => (
                  <div key={l} style={{ padding: "1rem", border: "1px solid #111" }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.2rem" }}>{v}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.55rem", color: "#444", letterSpacing: "0.04em" }}>{l}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section id="skills" style={{ padding: mobile ? "5rem 1.5rem" : "8rem 4rem", background: "#050505", borderTop: "1px solid #111" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "4rem" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", letterSpacing: "0.2em", textTransform: "uppercase" }}>Technical Skills</div>
              <div style={{ flex: 1, height: "1px", background: "#1a1a1a" }} />
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? "0" : "0 5rem" }}>
            {SKILL_BARS.map((s, i) => (
              <SkillBar key={s.name} {...s} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects" style={{ padding: mobile ? "5rem 1.5rem" : "8rem 4rem", borderTop: "1px solid #111" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "3rem" }}>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.8rem" }}>Selected Work</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: mobile ? "2rem" : "clamp(2rem,5vw,3.5rem)", fontWeight: 700 }}>Projects</h2>
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#444" }}>5 systems</div>
            </div>
          </FadeIn>
          {PROJECTS.map((p, i) => (
            <FadeIn key={p.id} delay={i * 0.05}>
              <ProjectCard project={p} mobile={mobile} />
            </FadeIn>
          ))}
          <div style={{ borderTop: "1px solid #1e1e1e" }} />
        </div>
      </section>

      {/* ── PHILOSOPHY ── */}
      <section id="philosophy" style={{ padding: mobile ? "5rem 1.5rem" : "8rem 4rem", background: "#050505", borderTop: "1px solid #111" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.7rem" }}>Philosophy</div>
            <div style={{ width: "40px", height: "1px", background: "#E31B1B", marginBottom: "2rem" }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: mobile ? "1.75rem" : "clamp(1.8rem,4vw,2.8rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: "2.5rem" }}>
              Engineering<br /><span style={{ fontStyle: "italic", color: "#E31B1B" }}>with intention.</span>
            </h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: "1.5rem" }}>
            {[
              ["Architecture before features", "A system without a clear structural rationale accumulates complexity rather than capability. I start with how components relate before writing a single line."],
              ["Modularity as a first principle", "Each subsystem should be independently legible, testable, and extensible. Coupling is a liability. I design for the maintainer, not just for the demo."],
              ["Data as a design input", "Behavioral data, usage patterns, and decision histories are engineering inputs — not just analytics. My systems treat behavioral signals as first-class citizens."],
              ["AI as a tool, not a crutch", "Vibe coding means using AI to move faster — not to avoid thinking. The architecture, the problem definition, and the judgment still come from the engineer."],
            ].map(([title, body], i) => (
              <FadeIn key={title} delay={i * 0.1}>
                <div style={{ padding: "1.8rem", border: "1px solid #111", transition: "border-color 0.3s, background 0.3s", height: "100%" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#E31B1B"; e.currentTarget.style.background = "#0a0a0a"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#111"; e.currentTarget.style.background = "transparent"; }}
                >
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.7rem" }}>{title}</h3>
                  <p style={{ color: "#666", fontSize: "0.88rem", lineHeight: 1.8, fontWeight: 300 }}>{body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUTURE GOALS ── */}
      <section style={{ padding: mobile ? "5rem 1.5rem" : "8rem 4rem", borderTop: "1px solid #111", overflow: "hidden", position: "relative" }}>
        {!mobile && <div style={{ position: "absolute", top: "50%", right: "-5%", transform: "translateY(-50%)", fontFamily: "'Playfair Display', serif", fontSize: "18vw", fontWeight: 900, color: "rgba(227,27,27,0.03)", lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>2026</div>}
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1.2rem" }}>Future Goals</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: mobile ? "1.75rem" : "clamp(2rem,5vw,3.5rem)", fontWeight: 700, lineHeight: 1.2, maxWidth: "700px", marginBottom: "3rem" }}>
              Building platforms that make decisions <span style={{ color: "#E31B1B", fontStyle: "italic" }}>intelligently.</span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: "2rem", maxWidth: "800px" }}>
              {[
                "Design decision-support platforms combining behavioral AI with structured backends to assist real-world choices.",
                "Build backend infrastructure that scales behavioral data pipelines into production-grade architectures.",
                "Contribute to open-source AI tooling — particularly explainability and recommendation system evaluation.",
                "Pursue work at the intersection of intelligent automation and behavioral science.",
              ].map((goal, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", color: "#E31B1B", marginTop: "0.2rem", flexShrink: 0 }}>0{i + 1}</span>
                    <p style={{ color: "#777", fontSize: "0.9rem", lineHeight: 1.8, fontWeight: 300 }}>{goal}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── TECHPIRATES ── */}
      <TechPiratesSection mobile={mobile} />

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding: mobile ? "5rem 1.5rem 4rem" : "8rem 4rem 6rem", background: "#050505", borderTop: "1px solid #111" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1.2rem" }}>Contact</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: mobile ? "2.8rem" : "clamp(2.5rem,7vw,6rem)", fontWeight: 900, lineHeight: 1, marginBottom: "3rem" }}>
              Let's build<br /><span style={{ color: "#E31B1B", fontStyle: "italic" }}>something.</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div style={{
              display: "grid",
              gridTemplateColumns: mobile ? "1fr 1fr" : `repeat(${CONTACT_LINKS.length}, 1fr)`,
              borderTop: "1px solid #1a1a1a",
            }}>
              {CONTACT_LINKS.map((c, i) => (
                <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
                  style={{
                    padding: mobile ? "1.5rem 1rem" : "2.5rem 2rem",
                    borderRight: mobile ? (i % 2 === 0 ? "1px solid #1a1a1a" : "none") : (i < CONTACT_LINKS.length - 1 ? "1px solid #1a1a1a" : "none"),
                    borderBottom: "1px solid #1a1a1a",
                    textDecoration: "none", display: "block", transition: "background 0.3s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#0d0d0d"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.56rem", color: "#E31B1B", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.6rem" }}>{c.label}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: mobile ? "0.82rem" : "1rem", color: "#ccc", fontWeight: 300, wordBreak: "break-all" }}>{c.value}</div>
                  <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#444" }}>↗</div>
                </a>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: mobile ? "1.5rem" : "2rem 4rem", borderTop: "1px solid #111", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#2a2a2a" }}>© 2025 Surya J</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#2a2a2a" }}>DARX · CSE · 2026</div>
      </footer>
    </div>
  );
}
