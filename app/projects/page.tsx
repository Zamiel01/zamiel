"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { FaArrowUpRightFromSquare, FaGithub, FaGooglePlay } from "react-icons/fa6";
import { usePageTransition } from "../components/PageTransitionProvider";

const projects = [
  {
    name: "eFarm Marketplace",
    description:
      "Agricultural e-commerce platform for Cameroon — connecting farmers and buyers with product listings, multi-provider payments, and a PWA-optimized experience. Achieved 40% faster load times and 25% higher checkout conversion in production.",
    tech: ["Angular 20", "NGXS", "Flutterwave", "PayUnit", "Nginx", "PM2"],
    image: "/images/efarmweb.png",
    live: "https://efarm.cm",
    github: "https://github.com/zamiel01",
    featured: true,
  },
  {
    name: "eFarm Mobile App",
    description:
      "Cross-platform Flutter app powering the eFarm agricultural marketplace on Android and iOS. Features BLoC state management, integrated payments, and offline-capable architecture.",
    tech: ["Flutter", "Dart", "BLoC", "Firebase", "SQLite"],
    image: "/images/mobile.jpg",
    live: "https://efarm.cm",
    playstore:
      "https://play.google.com/store/apps/details?id=com.efarm.studio.efarm",
    github: "https://github.com/zamiel01",
    portrait: true,
  },
  {
    name: "GodsEye",
    description:
      "Cybersecurity platform for locating lost phones and checking email/password exposure in known data breaches with real-time lookups.",
    tech: ["Next.js", "React", "Supabase", "TypeScript"],
    image: "/images/godseye.png",
    live: "https://godseye.vercel.app",
    github: "https://github.com/zamiel01",
  },
  {
    name: "Todo Management API",
    description:
      "Production-ready REST API built with FastAPI supporting multi-user authenticated CRUD operations, OAuth2 login, and SQLAlchemy ORM.",
    tech: ["Python", "FastAPI", "SQLAlchemy", "JWT", "Pytest"],
    image: "/images/api.png",
    github: "https://github.com/zamiel01",
  },
  {
    name: "Real-Time Object Detection Glasses",
    description:
      "Capstone project for GETEC National Competition 2025 combining embedded hardware with GenAI models for visually impaired aid.",
    tech: ["Python", "TensorFlow", "OpenCV", "Raspberry Pi", "GenAI"],
    image: "/images/glasses.jpg",
    github: "https://github.com/zamiel01",
  },
];

export default function Projects() {
  const { navigate } = usePageTransition();
  const navigating = useRef(false);

  useEffect(() => {
    const go = (href: string) => {
      if (navigating.current) return;
      navigating.current = true;
      navigate(href);
    };

    const atTop = () => window.scrollY <= 0;
    const atBottom = () =>
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 5;

    // Only a fresh wheel / trackpad gesture at an edge changes pages.
    let lastWheelAt = 0;
    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      const isFreshGesture = now - lastWheelAt > 200;
      lastWheelAt = now;

      if (e.deltaY < -20 && atTop() && isFreshGesture) go("/about");
      if (e.deltaY > 20 && atBottom() && isFreshGesture) go("/contact");
    };

    // Touch swipes must start at the relevant edge.
    let startY = 0;
    let startedAtTop = false;
    let startedAtBottom = false;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startedAtTop = atTop();
      startedAtBottom = atBottom();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (startedAtTop && e.touches[0].clientY - startY > 60 && atTop()) {
        go("/about");
      } else if (
        startedAtBottom &&
        startY - e.touches[0].clientY > 60
      ) {
        go("/contact");
      }
    };

    // Keyboard navigation is edge-triggered and ignores held-down repeats.
    const onKey = (e: KeyboardEvent) => {
      if (
        e.repeat ||
        (e.target instanceof HTMLElement &&
          (e.target.isContentEditable ||
            e.target.closest("input, textarea, select, [contenteditable='true']")))
      ) {
        return;
      }
      if (["ArrowUp", "PageUp", "Home"].includes(e.key) && atTop()) {
        go("/about");
      } else if (
        ["ArrowDown", "PageDown", "End"].includes(e.key) &&
        atBottom()
      ) {
        go("/contact");
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col px-6 lg:px-24 py-16">
      
      {/* Header Area */}
      <motion.div 
        className="mb-12"
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#888888]">
          PORTFOLIO SHOWCASE
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mt-2 tracking-tight">
          Featured <span >Projects</span>
        </h1>
        <p className="text-[#aaaaaa] mt-3 max-w-xl text-base">
          A curated selection of production web apps, mobile solutions, backend systems, and AI hardware experiments.
        </p>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
        {projects.map((project, index) => (
          <motion.div
            key={project.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -6, transition: { duration: 0.25 } }}
            className={`bg-[#121212] border border-[#222222] rounded-3xl p-6 md:p-8 flex flex-col justify-between group hover:border-white/40 transition-colors duration-300 relative overflow-hidden ${
              project.featured ? "md:col-span-2 lg:col-span-2" : "col-span-1"
            }`}
          >
            {/* Background subtle glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div>
              {/* Top row index & Links */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-[#777777] bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-1 rounded-full">
                  0{index + 1}
                </span>
                <div className="flex items-center space-x-2">
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-full border border-[#333333] bg-[#181818] flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                      title="Live Preview"
                    >
                      <FaArrowUpRightFromSquare className="text-xs" />
                    </a>
                  )}
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full border border-[#333333] bg-[#181818] flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                    title="Source Code"
                  >
                    <FaGithub className="text-sm" />
                  </a>
                  {project.playstore && (
                    <a
                      href={project.playstore}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-full border border-[#333333] bg-[#181818] flex items-center justify-center text-white hover:bg-[#1DB954] hover:text-black transition-colors"
                      title="Google Play Store"
                    >
                      <FaGooglePlay className="text-xs" />
                    </a>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#f0f0f0] transition-colors">
                {project.name}
              </h3>
              <p className="text-[#aaaaaa] text-sm leading-relaxed mb-6">
                {project.description}
              </p>
            </div>

            <div>
              {/* Media Preview Box */}
              <div className={`relative w-full rounded-2xl overflow-hidden border border-[#222222] bg-[#181818] mb-6 ${
                project.portrait ? "h-64 sm:h-72" : "h-48 sm:h-56"
              }`}>
                <Image
                  src={project.image}
                  alt={project.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Tech Badges */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#222222]">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="bg-[#181818] text-[#cccccc] border border-[#2a2a2a] text-xs px-2.5 py-1 rounded-md font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

          </motion.div>
        ))}
      </div>

    </div>
  );
}