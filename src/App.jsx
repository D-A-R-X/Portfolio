import { useState, useEffect, useRef } from "react";

const NAV_LINKS = ["About", "Skills", "Projects", "Philosophy", "Contact"];

const CONTACT_LINKS = [
  { label: "Email", value: "surya777dbs@gmail.com", href: "mailto:surya777dbs@gmail.com" },
  { label: "WhatsApp", value: "wa.me/qr/U4KOUOEM4BFXA1", href: "https://wa.me/qr/U4KOUOEM4BFXA1" },
  { label: "Instagram", value: "@itz._darx._", href: "https://www.instagram.com/itz._darx._?igsh=ajJweWQ5eDU2N2I3" },
  { label: "LinkedIn", value: "Surya J", href: "https://www.linkedin.com/in/surya-j-194910306" },
];

const SKILLS = {
  "Languages": ["Python", "Dart", "JavaScript"],
  "Frameworks": ["FastAPI", "Flutter", "Firebase"],
  "Backend & DB": ["REST APIs", "SQLite", "Firestore"],
  "AI / GenAI": ["Machine Learning", "Generative AI", "Behavioral Analysis", "Recommendation Systems"],
  "Frontend": ["HTML", "CSS", "JavaScript", "Vibe Coding"],
  "Tooling": ["Git", "GitHub", "VS Code"],
  "Deployment": ["Render", "Vercel"],
};

const PROJECTS = [
  {
    id: "01",
    name: "Mentorix",
    tag: "Behavioral Career Intelligence Engine",
    problem: "Students receive generic career advice that ignores behavioral patterns and decision history. Static data fails to capture evolving academic signals.",
    stack: ["Python", "FastAPI", "RandomForest", "SQLite", "HTML/CSS/JS"],
    deploy: ["Render", "Vercel"],
    power: "A behavioral AI engine that analyzes academic and decision patterns to predict career instability and recommend structured career paths.",
    highlight: "Stability Index computed via momentum tracking, volatility detection, and track-flip analysis across user sessions — not single snapshots.",
    repo: "https://github.com/D-A-R-X/mentorix-ai",
    repoLabel: "GitHub",
  },
  {
    id: "02",
    name: "Megatron",
    tag: "Modular Adaptive AI Control System",
    problem: "Single-purpose AI systems lack modularity, making them brittle and difficult to scale or extend with new capabilities.",
    stack: ["Python", "FastAPI", "HTML", "CSS", "JavaScript"],
    deploy: [],
    power: "A modular AI controller that analyzes context and delegates tasks across specialized modules using centralized reasoning.",
    highlight: "Central reasoning layer determines intent and routes to isolated modules — each returning structured output without coupling to core logic.",
    repo: "https://github.com/D-A-R-X/Megatron",
    repoLabel: "GitHub",
  },
  {
    id: "03",
    name: "Smart Campus",
    tag: "Academic Resource Management System",
    problem: "Academic resources are fragmented across platforms, creating friction in access and version control for students.",
    stack: ["Flutter", "Firebase Auth", "Firestore", "Firebase Storage"],
    deploy: ["Play Store"],
    power: "A centralized mobile platform that securely delivers academic resources with offline accessibility.",
    highlight: "Cloud-native architecture with local download support — ensuring access continuity regardless of connectivity.",
    repo: "https://play.google.com/store/apps/details?id=com.schrodingerlab.curiosity",
    repoLabel: "Play Store",
  },
  {
    id: "04",
    name: "Fitcore",
    tag: "AI-Based Fitness Tracking System",
    problem: "Most fitness apps rely on manual input, enabling data manipulation and generating inaccurate progress metrics.",
    stack: ["Flutter", "Firebase Auth", "Firestore"],
    deploy: [],
    power: "A fitness tracking system that uses adaptive logic to ensure accurate and cheat-resistant progress tracking.",
    highlight: "Dynamic experience-based leveling calculated from verified activity data — not user-reported figures.",
    repo: null,
    repoLabel: "In Progress",
  },
  {
    id: "05",
    name: "Drive Track Mate",
    tag: "Intelligent Driving Monitoring System",
    problem: "Passive dash cameras record continuous video without context, making critical event retrieval slow and unreliable.",
    stack: ["Android Interface", "Dash Camera Integration", "Event-Based Recording"],
    deploy: [],
    power: "An intelligent driving monitoring system that captures and contextualizes critical driving events for safety and evidence reliability.",
    highlight: "Event-aware recording tags sudden braking and abrupt maneuvers with timestamps and contextual metadata automatically.",
    repo: "https://github.com/D-A-R-X/drive-track-mate",
    repoLabel: "GitHub",
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function ProjectCard({ project }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderTop: "1px solid #222",
        padding: "0",
        cursor: "pointer",
      }}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "2rem 0",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "1.5rem", flex: 1 }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.75rem", color: "#E31B1B", letterSpacing: "0.1em" }}>
            {project.id}
          </span>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.2rem, 3vw, 1.6rem)", fontWeight: 700, color: "#fff", margin: 0 }}>
              {project.name}
            </h3>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#666", margin: "0.3rem 0 0", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {project.tag}
            </p>
          </div>
        </div>
        <div style={{
          width: "28px", height: "28px", border: "1px solid #333", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: open ? "#E31B1B" : "#666", fontSize: "1.1rem",
          transition: "transform 0.3s, color 0.3s",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          flexShrink: 0,
        }}>+</div>
      </div>

      <div style={{
        overflow: "hidden",
        maxHeight: open ? "700px" : "0",
        transition: "max-height 0.5s ease",
      }}>
        <div style={{ paddingBottom: "2.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          <div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Problem</p>
            <p style={{ color: "#aaa", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>{project.problem}</p>
          </div>
          <div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Key Design</p>
            <p style={{ color: "#aaa", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>{project.highlight}</p>
          </div>
          <div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Stack</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {project.stack.map(s => (
                <span key={s} style={{ border: "1px solid #333", padding: "0.2rem 0.6rem", fontSize: "0.72rem", color: "#ccc", fontFamily: "'DM Mono', monospace" }}>{s}</span>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.6rem" }}>Core Output</p>
            <p style={{ color: "#ccc", fontSize: "0.88rem", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>{project.power}</p>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            {project.repo ? (
              <a href={project.repo} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", border: "1px solid #E31B1B", padding: "0.5rem 1.2rem", color: "#E31B1B", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.1em", textDecoration: "none", transition: "background 0.2s, color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#E31B1B"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#E31B1B"; }}
              >↗ View on {project.repoLabel}</a>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", border: "1px solid #2a2a2a", padding: "0.5rem 1.2rem", color: "#444", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.1em" }}>
                ◌ {project.repoLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TechPiratesSection() {
  const [ref, inView] = useInView(0.2);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 600);
    return () => clearInterval(id);
  }, []);

  const dots = ".".repeat((tick % 3) + 1).padEnd(3, "\u00a0");

  return (
    <section style={{ padding: "8rem 4rem", background: "#050505", borderTop: "1px solid #111", position: "relative", overflow: "hidden" }}>
      {/* Animated background noise grid */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: "radial-gradient(circle at 70% 50%, rgba(227,27,27,0.04) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      <div ref={ref} style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Label row */}
        <div style={{
          display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "5rem",
          opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", letterSpacing: "0.2em", textTransform: "uppercase" }}>Venture</div>
          <div style={{ flex: 1, height: "1px", background: "#1a1a1a" }} />
        </div>

        {/* Main content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6rem", alignItems: "center" }}>

          {/* Left — name + badge */}
          <div style={{
            opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s",
          }}>
            {/* Stealth badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.6rem",
              border: "1px solid #2a2a2a", padding: "0.4rem 1rem",
              marginBottom: "2rem", background: "#0d0d0d",
            }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%", background: "#E31B1B",
                boxShadow: "0 0 6px #E31B1B",
                animation: "blink 1.2s ease-in-out infinite",
              }} />
              <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }`}</style>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", color: "#888", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Stealth Mode · Building{dots}
              </span>
            </div>

            {/* Name */}
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(3rem, 7vw, 6rem)",
              fontWeight: 900, lineHeight: 0.95,
              letterSpacing: "-0.02em",
              marginBottom: "1.5rem",
            }}>
              Tech<span style={{ color: "#E31B1B" }}>Pirates</span>
            </h2>

            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.15rem", color: "#666", fontStyle: "italic",
              fontWeight: 300, lineHeight: 1.6, maxWidth: "340px",
            }}>
              A dev agency & freelance studio — currently in formation.
            </p>
          </div>

          {/* Right — redacted card */}
          <div style={{
            opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(30px)",
            transition: "opacity 0.8s ease 0.25s, transform 0.8s ease 0.25s",
          }}>
            <div style={{ border: "1px solid #1a1a1a", padding: "3rem", background: "#080808" }}>
              {/* Redacted lines */}
              {[
                { label: "Studio Type", value: "Dev Agency · Freelance Studio" },
                { label: "Status", value: null },
                { label: "Focus", value: null },
                { label: "Est.", value: "TBD" },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "1rem 0", borderBottom: "1px solid #111",
                }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", color: "#444", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
                  {value ? (
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", color: "#888" }}>{value}</span>
                  ) : (
                    <span style={{
                      display: "inline-block", width: "120px", height: "10px",
                      background: "repeating-linear-gradient(90deg, #1e1e1e 0px, #1e1e1e 8px, #111 8px, #111 10px)",
                      borderRadius: "2px",
                    }} />
                  )}
                </div>
              ))}

              {/* Bottom note */}
              <div style={{ marginTop: "2rem", display: "flex", gap: "0.8rem", alignItems: "flex-start" }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#E31B1B", flexShrink: 0, marginTop: "2px" }}>!</span>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#444", lineHeight: 1.8, letterSpacing: "0.03em" }}>
                  Details are being withheld until launch. More information will be published when the studio goes live.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorHover, setCursorHover] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const move = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    const links = document.querySelectorAll("a, button, [data-hover]");
    const on = () => setCursorHover(true);
    const off = () => setCursorHover(false);
    links.forEach(l => { l.addEventListener("mouseenter", on); l.addEventListener("mouseleave", off); });
    return () => links.forEach(l => { l.removeEventListener("mouseenter", on); l.removeEventListener("mouseleave", off); });
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div style={{ background: "#0a0a0a", color: "#fff", minHeight: "100vh", fontFamily: "'Cormorant Garamond', serif", overflowX: "hidden" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Mono:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::selection { background: #E31B1B; color: #fff; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #E31B1B; }
        body { cursor: none; }
        a { cursor: none; }
        button { cursor: none; }
        @media (max-width: 768px) { body { cursor: auto; } }
      `}</style>

      {/* Custom Cursor */}
      <div style={{
        position: "fixed", top: 0, left: 0, zIndex: 9999, pointerEvents: "none",
        transform: `translate(${cursorPos.x - (cursorHover ? 20 : 6)}px, ${cursorPos.y - (cursorHover ? 20 : 6)}px)`,
        width: cursorHover ? "40px" : "12px",
        height: cursorHover ? "40px" : "12px",
        border: cursorHover ? "1.5px solid #E31B1B" : "none",
        background: cursorHover ? "transparent" : "#E31B1B",
        borderRadius: "50%",
        transition: "width 0.25s, height 0.25s, transform 0.08s linear, background 0.25s",
        mixBlendMode: "normal",
      }} />

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: "1.5rem 4rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(10,10,10,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom: scrolled ? "1px solid #1a1a1a" : "none",
        transition: "all 0.4s ease",
      }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", letterSpacing: "0.15em", color: "#E31B1B" }}>
          DARX
        </div>
        <div style={{ display: "flex", gap: "2.5rem" }}>
          {NAV_LINKS.map(l => (
            <button key={l} onClick={() => scrollTo(l)}
              data-hover
              style={{ background: "none", border: "none", color: "#888", fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: 0, transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = "#888"}
            >{l}</button>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <section id="about" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 4rem 6rem", position: "relative", overflow: "hidden" }}>
        {/* Background grid */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: "linear-gradient(rgba(227,27,27,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(227,27,27,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
        {/* Red accent line */}
        <div style={{ position: "absolute", top: "20%", right: "8%", width: "1px", height: "200px", background: "linear-gradient(transparent, #E31B1B, transparent)", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: "#E31B1B", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
            — Computer Science Engineering · 2022–2026
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(4rem, 10vw, 9rem)", fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: "2rem" }}>
            Surya J<span style={{ color: "#E31B1B" }}>.</span>
          </h1>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)", fontWeight: 300, color: "#888", maxWidth: "520px", lineHeight: 1.6, fontStyle: "italic" }}>
              Building intelligent software systems, backend architectures, and AI-driven applications — with an emphasis on behavioral intelligence and modular design.
            </p>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#555", lineHeight: 2, textAlign: "right" }}>
              <div>Madurai, Tamil Nadu</div>
              <div>India · D-A-R-X</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "1px", height: "50px", background: "linear-gradient(transparent, #E31B1B)", animation: "pulse 2s ease-in-out infinite" }} />
          <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
        </div>
      </section>

      {/* ABOUT */}
      <section style={{ padding: "8rem 4rem", borderTop: "1px solid #111" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "280px 1fr", gap: "6rem", alignItems: "start" }}>
          <FadeIn>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1rem" }}>About</div>
            <div style={{ width: "40px", height: "1px", background: "#E31B1B" }} />
          </FadeIn>
          <FadeIn delay={0.15}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: "2rem" }}>
              Systems thinker.<br /><span style={{ color: "#E31B1B", fontStyle: "italic" }}>Intelligence architect.</span>
            </h2>
            <p style={{ fontSize: "1.05rem", color: "#999", lineHeight: 1.9, marginBottom: "1.5rem", fontWeight: 300 }}>
              I'm a Computer Science Engineering student at Dhanalakshmi Srinivasan College of Engineering, Coimbatore, graduating in 2026. My work sits at the intersection of backend systems, applied machine learning, and behavioral data analysis.
            </p>
            <p style={{ fontSize: "1.05rem", color: "#999", lineHeight: 1.9, marginBottom: "1.5rem", fontWeight: 300 }}>
              Rather than building surface-level applications, I focus on designing systems with clear architectural rationale — where each layer has a defined role, and the whole is more useful than the sum of its parts. I'm drawn to problems where behavior, data, and decision-making intersect.
            </p>
            <p style={{ fontSize: "1.05rem", color: "#999", lineHeight: 1.9, fontWeight: 300 }}>
              My projects reflect this — from behavioral career intelligence engines to modular AI control systems, each built with an explicit engineering goal rather than a feature checklist.
            </p>
            <div style={{ marginTop: "3rem", display: "flex", gap: "3rem", flexWrap: "wrap" }}>
              {[["BE · CSE", "Dhanalakshmi Srinivasan"], ["2022 – 2026", "Expected Graduation"], ["Madurai", "Tamil Nadu, India"], ["github.com/D-A-R-X", "GitHub"]].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 700, marginBottom: "0.3rem" }}>{v}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#555", letterSpacing: "0.05em" }}>{l}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" style={{ padding: "8rem 4rem", background: "#050505", borderTop: "1px solid #111" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "5rem" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", letterSpacing: "0.2em", textTransform: "uppercase" }}>Technical Skills</div>
              <div style={{ flex: 1, height: "1px", background: "#1a1a1a" }} />
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0" }}>
            {Object.entries(SKILLS).map(([cat, items], i) => (
              <FadeIn key={cat} delay={i * 0.07}>
                <div style={{ padding: "2rem", border: "1px solid #111", borderCollapse: "collapse", transition: "border-color 0.3s, background 0.3s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#E31B1B"; e.currentTarget.style.background = "#0d0d0d"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#111"; e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#E31B1B", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "1rem" }}>{cat}</div>
                  {items.map(item => (
                    <div key={item} style={{ fontSize: "0.95rem", color: "#ccc", lineHeight: 2, fontWeight: 300 }}>{item}</div>
                  ))}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" style={{ padding: "8rem 4rem", borderTop: "1px solid #111" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "4rem" }}>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1rem" }}>Selected Work</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700 }}>Projects</h2>
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#444" }}>5 systems</div>
            </div>
          </FadeIn>
          <div>
            {PROJECTS.map((p, i) => (
              <FadeIn key={p.id} delay={i * 0.06}>
                <ProjectCard project={p} />
              </FadeIn>
            ))}
            <div style={{ borderTop: "1px solid #222" }} />
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section id="philosophy" style={{ padding: "8rem 4rem", background: "#050505", borderTop: "1px solid #111" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "280px 1fr", gap: "6rem", alignItems: "start" }}>
          <FadeIn>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1rem" }}>Philosophy</div>
            <div style={{ width: "40px", height: "1px", background: "#E31B1B" }} />
          </FadeIn>
          <div>
            <FadeIn delay={0.1}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: "3rem" }}>
                Engineering<br /><span style={{ fontStyle: "italic", color: "#E31B1B" }}>with intention.</span>
              </h2>
            </FadeIn>
            {[
              ["Architecture before features", "A system without a clear structural rationale accumulates complexity rather than capability. I start with the question of how components relate before writing a single line of code."],
              ["Modularity as a first principle", "Each subsystem should be independently legible, testable, and extensible. Coupling is a liability. I design for the maintainer who inherits the code, not just for the demo."],
              ["Data as a design input", "Behavioral data, usage patterns, and decision histories are engineering inputs — not just analytics. The systems I build treat behavioral signals as first-class citizens."],
              ["Solve real constraint, not hypothetical scale", "Premature optimization is a known antipattern. I prioritize solving the actual problem clearly before engineering for scale that may never be needed."],
            ].map(([title, body], i) => (
              <FadeIn key={title} delay={i * 0.1 + 0.15}>
                <div style={{ marginBottom: "2.5rem", paddingLeft: "1.5rem", borderLeft: "1px solid #1a1a1a" }}
                  onMouseEnter={e => e.currentTarget.style.borderLeftColor = "#E31B1B"}
                  onMouseLeave={e => e.currentTarget.style.borderLeftColor = "#1a1a1a"}
                  style={{ marginBottom: "2.5rem", paddingLeft: "1.5rem", borderLeft: "1px solid #1a1a1a", transition: "border-color 0.3s" }}
                >
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.6rem" }}>{title}</h3>
                  <p style={{ color: "#777", fontSize: "0.95rem", lineHeight: 1.8, fontWeight: 300 }}>{body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FUTURE GOALS */}
      <section style={{ padding: "8rem 4rem", borderTop: "1px solid #111", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", top: "50%", right: "-5%", transform: "translateY(-50%)", fontFamily: "'Playfair Display', serif", fontSize: "18vw", fontWeight: 900, color: "rgba(227,27,27,0.03)", lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>2026</div>
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "2rem" }}>Future Goals</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, lineHeight: 1.2, maxWidth: "700px", marginBottom: "3rem" }}>
              Building platforms that make decisions <span style={{ color: "#E31B1B", fontStyle: "italic" }}>intelligently.</span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", maxWidth: "800px" }}>
              {[
                "Design decision-support platforms that combine behavioral AI with structured backend systems to assist real-world choices.",
                "Build backend infrastructure that scales behavioral data pipelines into production-grade, latency-aware architectures.",
                "Contribute to open-source tooling in the AI/ML space, particularly around explainability and recommendation system evaluation.",
                "Pursue research at the intersection of intelligent automation and behavioral science — applying software to understand human decision patterns.",
              ].map((goal, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", marginTop: "0.2rem", flexShrink: 0 }}>0{i + 1}</span>
                    <p style={{ color: "#888", fontSize: "0.95rem", lineHeight: 1.8, fontWeight: 300 }}>{goal}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* TECHPIRATES */}
      <TechPiratesSection />

      {/* CONTACT */}
      <section id="contact" style={{ padding: "8rem 4rem 6rem", background: "#050505", borderTop: "1px solid #111" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#E31B1B", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "2rem" }}>Contact</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.5rem, 7vw, 6rem)", fontWeight: 900, lineHeight: 1, marginBottom: "4rem" }}>
              Let's build<br /><span style={{ color: "#E31B1B", fontStyle: "italic" }}>something.</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div style={{ display: "flex", gap: "0", borderTop: "1px solid #1a1a1a" }}>
              {CONTACT_LINKS.map((c, i) => (
                <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" data-hover
                  style={{
                    flex: 1, padding: "2.5rem 2rem", borderRight: i < CONTACT_LINKS.length - 1 ? "1px solid #1a1a1a" : "none",
                    textDecoration: "none", display: "block", transition: "background 0.3s",
                    borderBottom: "1px solid #1a1a1a",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#0d0d0d"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#E31B1B", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.8rem" }}>{c.label}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", color: "#ccc", fontWeight: 300, wordBreak: "break-all" }}>{c.value}</div>
                  <div style={{ marginTop: "1.5rem", fontSize: "1.2rem", color: "#444" }}>↗</div>
                </a>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "2rem 4rem", borderTop: "1px solid #111", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#333" }}>© 2025 Surya J</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#333" }}>DARX · CSE · 2026</div>
      </footer>
    </div>
  );
}
