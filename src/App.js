import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Particles from "react-tsparticles";
// import { loadFull } from "tsparticles";
import { loadSlim } from "tsparticles-slim"; // smaller bundle

// Lazy-load games (code-splitting)
const SnakeGame  = React.lazy(() => import("./components/SnakeGame"));
const PongGame   = React.lazy(() => import("./components/PongGame"));
const TetrisGame = React.lazy(() => import("./components/TetrisGame"));

export default function App() {
  const [theme, setTheme] = useState(() => {
    // initialize from localStorage or system preference
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const [activeGame, setActiveGame] = useState(null);
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", theme);
  }, [theme, isDark]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine); // or await loadFull(engine);
  }, []);

  const particlesOptions = useMemo(() => ({
    fullScreen: { enable: false },
    background: { color: { value: isDark ? "#0f172a" : "#f9fafb" } },
    fpsLimit: 60,
    interactivity: {
      events: { onHover: { enable: true, mode: "repulse" }, resize: true },
      modes: { repulse: { distance: 100, duration: 0.4 } },
    },
    particles: {
      number: { value: 80, density: { enable: true, area: 800 } },
      color: { value: isDark ? "#ffffff" : "#1e293b" },
      links: { enable: true, color: isDark ? "#ffffff" : "#1e293b", distance: 150, opacity: 0.3, width: 1 },
      move: { enable: true, speed: 1, outModes: { default: "bounce" } },
      opacity: { value: 0.4 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 5 } },
    },
    detectRetina: true,
  }), [isDark]);

  const contacts = useMemo(() => ([
    { icon: "📧", label: "Email", href: "mailto:shawjonfin1@gmail.com" },
    { icon: "💻", label: "GitHub", href: "https://github.com/FinlayShaw02" },
    { icon: "🔗", label: "LinkedIn", href: "https://www.linkedin.com/in/finlay-s-25227a232/" },
  ]), []);

  const skills = useMemo(() => ([
    "React","Node.js","JavaScript","HTML","Tailwind CSS","Java","Python","PHP","C++","SQL",
    "UI/UX Design","Agile Methodologies","mySQL","Bootstrap"
  ]), []);

  const projects = useMemo(() => ([
    { title: "Personal Portfolio Website", description: "Responsive portfolio with React + Tailwind." },
    { title: "Zenith RP", description: "A FiveM Roleplay server built with Lua, React and more." },
    { title: "Namie Home", description: "Liquid/js building out componenets for a real world application." },
  ]), []);

  return (
    <div className={`relative min-h-screen overflow-hidden font-mono transition-colors duration-300 ${isDark ? "bg-[#0f172a] text-white" : "bg-[#f9fafb] text-black"}`}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        className="pointer-events-none select-none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}
      />

      <div className="relative z-10 flex justify-center items-start min-h-screen px-4 py-10 overflow-y-auto">
        <main
          className={`w-full max-w-4xl rounded-lg border shadow-xl p-4 sm:p-6 md:p-10 transition-all duration-300
            ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-gray-300 text-black"}`}
        >
          {activeGame ? (
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={() => setActiveGame(null)}
                className={`self-start px-3 py-1 text-sm rounded focus:outline-none focus:ring
                  ${isDark ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"}`}
                aria-label="Back to Portfolio"
              >
                ⬅ Back to Portfolio
              </button>

              <div className="w-full flex justify-center">
                <Suspense fallback={<div className="text-sm opacity-80">Loading game…</div>}>
                  {activeGame === "Snake"  && <SnakeGame isDark={isDark} />}
                  {activeGame === "Pong"   && <PongGame  isDark={isDark} />}
                  {activeGame === "Tetris" && <TetrisGame isDark={isDark} />}
                </Suspense>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">Finlay Shaw</h1>
                  <p className="text-cyan-600 dark:text-cyan-400">// Full-Stack Web Developer | Software Engineer</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`px-3 py-1 text-sm rounded transition focus:outline-none focus:ring
                    ${isDark ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"}`}
                  aria-label="Toggle Theme"
                >
                  Toggle Theme
                </button>
              </div>

              {/* Contact Links */}
              <div className="flex flex-wrap gap-3 mt-4">
                {contacts.map(({ icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition focus:outline-none focus:ring
                      ${isDark ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"}`}
                    aria-label={label}
                  >
                    {icon} {label}
                  </a>
                ))}
              </div>

              {/* About */}
              <section className="mt-8">
                <h2 className="text-yellow-500 dark:text-yellow-400">// About Me</h2>
                <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  I'm a passionate software developer with a love for building intuitive and efficient digital solutions…
                </p>
              </section>

              {/* Skills */}
              <section className="mt-6">
                <h2 className="text-yellow-500 dark:text-yellow-400">// Skills</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className={`px-2 py-1 rounded text-sm ${isDark ? "bg-slate-700 text-white" : "bg-gray-200 text-black"}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              {/* Education */}
              <section className="mt-6">
                <h2 className="text-yellow-500 dark:text-yellow-400">// Education</h2>
                <ul className={`list-disc ml-6 mt-2 space-y-1 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <li>A level Design and Technology (2018–2020)</li>
                  <li>Level 3 Information Technology (2018–2020)</li>
                  <li>BSc. Computer Science, Keele University (2020–2023)</li>
                  <li>MSc. Computer Science, Keele University (2023–2025)</li>
                </ul>
              </section>

              {/* Work Experience */}
              <section className="mt-6">
                <h2 className="text-yellow-500 dark:text-yellow-400">// Work Experience</h2>
                <ul className={`list-disc ml-6 mt-2 space-y-1 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <li>Intern Web Developer at Namie (2025)</li>
                </ul>
              </section>

              {/* Projects */}
              <section className="mt-6">
                <h2 className="text-purple-600 dark:text-purple-400 font-semibold">// Projects</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {projects.map((proj, idx) => (
                    <article
                      key={idx}
                      className={`p-4 rounded border text-sm transition transform hover:scale-[1.02] duration-200 hover:shadow-md
                        ${isDark ? "bg-slate-800 text-gray-200 border-slate-700" : "bg-white text-gray-800 border-gray-200 shadow-sm"}`}
                    >
                      <p>
                        <span className="text-purple-500">title</span>:{" "}
                        <span className="font-semibold">"{proj.title}"</span>
                      </p>
                      <p className="mt-2">{proj.description}</p>
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline mt-2 inline-block hover:opacity-80 transition"
                      >
                        View Project
                      </a>
                    </article>
                  ))}
                </div>
              </section>

              {/* Games */}
              <section className="mt-6">
                <h2 className="text-green-500 dark:text-green-400 font-semibold">// Games</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {["Snake","Tetris","Pong"].map((game) => (
                    <button
                      key={game}
                      onClick={() => setActiveGame(game)}
                      className={`text-left p-4 rounded border text-sm transition transform hover:scale-[1.02] duration-200 hover:shadow-md focus:outline-none focus:ring
                        ${isDark ? "bg-slate-800 text-gray-200 border-slate-700" : "bg-white text-gray-800 border-gray-200 shadow-sm"}`}
                      aria-label={`Play ${game}`}
                    >
                      <p className="font-semibold">{game}</p>
                      <p className="text-sm mt-1">Click to play</p>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
