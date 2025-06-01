import React, { useCallback, useEffect, useMemo, useState } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

import SnakeGame from "./components/SnakeGame";
import PongGame from "./components/PongGame";
import TetrisGame from "./components/TetrisGame";

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [activeGame, setActiveGame] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
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
      links: {
        enable: true,
        color: isDark ? "#ffffff" : "#1e293b",
        distance: 150,
        opacity: 0.3,
        width: 1,
      },
      move: { enable: true, speed: 1, outModes: { default: "bounce" } },
      opacity: { value: 0.4 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 5 } },
    },
    detectRetina: true,
  }), [isDark]);

  return (
    <div className={`relative min-h-screen overflow-hidden font-mono transition-colors duration-300 ${isDark ? "bg-[#0f172a] text-white" : "bg-[#f9fafb] text-black"}`}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        className="pointer-events-none select-none"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}
      />

      <div className="relative z-10 flex justify-center items-start min-h-screen px-4 py-10 overflow-y-auto">
        <main className={`w-full max-w-4xl rounded-lg border shadow-xl p-4 sm:p-6 md:p-10 transition-all duration-300
          ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-gray-300 text-black"}`}>

          {activeGame ? (
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={() => setActiveGame(null)}
                className={`self-start px-3 py-1 text-sm rounded ${
                  isDark ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"
                }`}
              >
                ⬅ Back to Portfolio
              </button>

              <div className="w-full flex justify-center">
                {activeGame === "Snake" && <SnakeGame isDark={isDark} />}
                {activeGame === "Pong" && <PongGame isDark={isDark} />}
                {activeGame === "Tetris" && <TetrisGame isDark={isDark} />}
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
                  className={`px-3 py-1 text-sm rounded transition ${
                    isDark ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"
                  }`}
                >
                  Toggle Theme
                </button>
              </div>

              {/* Contact Links */}
              <div className="flex flex-wrap gap-3 mt-4">
                {[{ icon: "📧", label: "Email", href: "mailto:shawjonfin1@gmail.com" },
                  { icon: "💻", label: "GitHub", href: "https://github.com/FinlayShaw02" },
                  { icon: "🔗", label: "LinkedIn", href: "https://www.linkedin.com/in/finlay-s-25227a232/" },
                  { icon: "📄", label: "Resume", href: "/resume.pdf" }]
                  .map(({ icon, label, href }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition ${
                        isDark ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-black"
                      }`}>
                      {icon} {label}
                    </a>
                  ))}
              </div>

              {/* About */}
              <section className="mt-8">
                <h2 className="text-yellow-500 dark:text-yellow-400">// About Me</h2>
                <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  I'm a passionate software developer with a love for building intuitive and efficient digital solutions.
                  With experience in both frontend and backend technologies, I enjoy solving real-world problems through code
                  and continuously exploring new tools and techniques to improve my craft.
                </p>
              </section>

              {/* Skills */}
              <section className="mt-6">
                <h2 className="text-yellow-500 dark:text-yellow-400">// Skills</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    "React", "Node.js", "JavaScript", "HTML", "Tailwind CSS", "Java",
                    "Python", "PHP", "C++", "SQL", "UI/UX Design", "Agile Methodologies",
                    "mySQL", "Bootstrap"
                  ].map(skill => (
                    <span
                      key={skill}
                      className={`px-2 py-1 rounded text-sm ${
                        isDark ? "bg-slate-700 text-white" : "bg-gray-200 text-black"
                      }`}
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
                  <li>A level Design and Technology (2018 - 2020)</li>
                  <li>Level 3 Information Technology (2018 - 2020)</li>
                  <li>BSc. in Computer Science, University of Keele (2020 - 2023)</li>
                  <li>Masters Degree in Computer Science, University of Keele (2023 - 2025)</li>
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
                  {[
                    {
                      title: "Personal Portfolio Website",
                      description: "A responsive portfolio site built with React and Tailwind CSS to showcase my projects and skills.",
                      link: "#"
                    },
                    {
                      title: "Task Manager App",
                      description: "A full-stack task manager using Node.js, Express, and MongoDB with authentication and real-time updates.",
                      link: "#"
                    },
                    {
                      title: "E-commerce Platform",
                      description: "A scalable e-commerce site using Next.js and Stripe for payments, with CMS integration for product management.",
                      link: "#"
                    }
                  ].map((proj, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded border text-sm transition transform hover:scale-[1.02] duration-200 hover:shadow-md ${
                        isDark ? "bg-slate-800 text-gray-200 border-slate-700" : "bg-white text-gray-800 border-gray-200 shadow-sm"
                      }`}
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
                    </div>
                  ))}
                </div>
              </section>

              {/* Games */}
              <section className="mt-6">
                <h2 className="text-green-500 dark:text-green-400 font-semibold">// Games</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {["Snake", "Tetris", "Pong"].map((game) => (
                    <div
                      key={game}
                      onClick={() => setActiveGame(game)}
                      className={`p-4 rounded border text-sm transition transform hover:scale-[1.02] duration-200 hover:shadow-md cursor-pointer ${
                        isDark ? "bg-slate-800 text-gray-200 border-slate-700" : "bg-white text-gray-800 border-gray-200 shadow-sm"
                      }`}
                    >
                      <p className="font-semibold">{game}</p>
                      <p className="text-sm mt-1">Click to play</p>
                    </div>
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
