"use client";

import Image from "next/image";
import { motion, cubicBezier } from "motion/react";
import { useEffect, useRef } from "react";
import { usePageTransition } from "../components/PageTransitionProvider";
import {
  FaDownload,
  FaPaperPlane,
  FaCalendar,
  FaUserGraduate,
  FaBriefcase,
  FaAws,
  FaJenkins,
} from "react-icons/fa6";
import {
  SiFlutter,
  SiDart,
  SiPython,
  SiFastapi,
  SiAngular,
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiJavascript,
  SiPostgresql,
  SiSupabase,
  SiFirebase,
  SiDocker,
  SiGithub,
  SiNginx,
  SiExpo,
  SiOpenai,
  SiAnthropic,
  SiX,
} from "react-icons/si";
import ContributionGraph from "@/app/components/ContributionGraph";

type Skill = {
  name: string;
  icon: React.ElementType;
  color: string;
};

type SkillCategory = {
  title: string;
  description: string;
  skills: Skill[];
};

const skillCategories: SkillCategory[] = [
  {
    title: "Frontend",
    description: "Modern web interfaces and frontend applications",
    skills: [
      { name: "Angular 20", icon: SiAngular, color: "#DD0031" },
      { name: "React.js", icon: SiReact, color: "#61DAFB" },
      { name: "Next.js", icon: SiNextdotjs, color: "#ffffff" },
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
      { name: "JavaScript", icon: SiJavascript, color: "#F7DF1E" },
    ],
  },
  {
    title: "Backend",
    description: "APIs, server-side systems and application logic",
    skills: [
      { name: "Python", icon: SiPython, color: "#3776AB" },
      { name: "FastAPI", icon: SiFastapi, color: "#009688" },
    ],
  },
  {
    title: "Mobile",
    description: "Cross-platform mobile application development",
    skills: [
      { name: "Flutter", icon: SiFlutter, color: "#02569B" },
      { name: "Dart", icon: SiDart, color: "#0175C2" },
      { name: "React Native", icon: SiReact, color: "#61DAFB" },
      { name: "Expo", icon: SiExpo, color: "#ffffff" },
    ],
  },
  {
    title: "Database & Cloud",
    description: "Data platforms, backend services and cloud infrastructure",
    skills: [
      { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
      { name: "Supabase", icon: SiSupabase, color: "#3ECF8E" },
      { name: "Firebase", icon: SiFirebase, color: "#FFCA28" },
      { name: "AWS", icon: FaAws, color: "#FF9900" },
    ],
  },
  {
    title: "DevOps & Tools",
    description:
      "Deployment, containers, infrastructure and development workflows",
    skills: [
      { name: "Docker", icon: SiDocker, color: "#2496ED" },
      { name: "GitHub CI/CD", icon: SiGithub, color: "#ffffff" },
      { name: "Nginx", icon: SiNginx, color: "#009639" },
      { name: "Jenkins", icon: FaJenkins, color: "#D24939" },
    ],
  },
  {
    title: "AI & Coding Agents",
    description:
      "AI assistants, agentic development and AI-powered coding workflows",
    skills: [
      { name: "Claude", icon: SiAnthropic, color: "#D97757" },
      { name: "ChatGPT", icon: SiOpenai, color: "#10A37F" },
      { name: "Kimi", icon: SiOpenai, color: "#ffffff" },
      { name: "Grok", icon: SiX, color: "#ffffff" },
      { name: "OpenCode", icon: SiOpenai, color: "#ffffff" },
      { name: "Codex", icon: SiOpenai, color: "#ffffff" },
    ],
  },
];

type TimelineItemData = {
  date: string;
  title: string;
  subtitle: string;
  desc: string;
  type: "education" | "experience";
  highlight?: {
    title: string;
    text: string;
    image: string;
  };
  tech?: string[];
};

const education: TimelineItemData[] = [
  {
    date: "2025 / 2026",
    title: "Bachelor of Technology",
    subtitle: "Institut Universitaire de la Côte (IUC)",
    desc: "Studied at IUC's School of Engineering and Applied Science. Built a strong foundation in software architecture, algorithms, mobile and web development, and systems engineering[cite: 4].",
    type: "education",
    highlight: {
      title: "Capstone Thesis  3rd Year Project",
      text: 'Designed "Real-Time Object Detection Glasses"  combining hardware with GenAI models for visually impaired aid. Finalist in the GETEC National Competition 2025[cite: 4].',
      image: "/images/graduation.png",
    },
  },
  {
    date: "2020 – 2023",
    title: "Advanced Level GCE (A-Levels)",
    subtitle: "Government Bilingual High School — Douala",
    desc: "Completed advanced secondary schooling in Douala, sitting for the Advanced Level GCE examinations in June 2023[cite: 4].",
    type: "education",
  },
  {
    date: "2019 – 2020",
    title: "Ordinary Level GCE (O-Levels)",
    subtitle: "GBHS Mamabanda",
    desc: "Successfully obtained the Ordinary Level Certificate at the end of the 2019/2020 academic cycle[cite: 4].",
    type: "education",
  },
];

const experience: TimelineItemData[] = [
  {
    date: "Oct 2023 – Sep 2026",
    title: "Flutter Mobile & Angular Web Developer",
    subtitle: "eFarm — Douala, Cameroon",
    desc: "Developed marketplace systems supporting thousands of listings, improving order completion by 40%. Integrated Flutterwave/PayUnit and deployed services using Nginx configurations on Ubuntu VPS environments with high CI/CD automation profiles[cite: 4].",
    type: "experience",
    tech: [
      "Angular 20",
      "TypeScript",
      "NGXS",
      "RxJS",
      "Flutter",
      "Dart",
      "Nginx",
      "Ubuntu VPS",
    ],
  },
  {
    date: "Sept 2022 – Mar 2023",
    title: "Backend Engineer",
    subtitle: "FASBI — Douala, Cameroon",
    desc: "Built secure Todo Management REST APIs using FastAPI supporting OAuth2 flows. Streamlined structured data handling performance operations up to 40% via advanced SQLAlchemy database modeling[cite: 4].",
    type: "experience",
    tech: ["Python", "FastAPI", "SQLAlchemy", "SQLite", "JWT"],
  },
];

const journeyItems: TimelineItemData[] = [...education, ...experience];

const journeyContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

const journeyItem = {
  hidden: {
    opacity: 0,
    y: 70,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: cubicBezier(0.16, 1, 0.3, 1),
    },
  },
};

const timelineLine = {
  hidden: {
    scaleY: 0,
    transformOrigin: "top",
  },
  visible: {
    scaleY: 1,
    transition: {
      duration: 1.8,
      ease: cubicBezier(0.16, 1, 0.3, 1),
    },
  },
};

const cardHover = {
  rest: {
    y: 0,
    scale: 1,
  },
  hover: {
    y: -8,
    scale: 1.015,
    transition: {
      duration: 0.35,
      ease: cubicBezier(0.16, 1, 0.3, 1),
    },
  },
};

const dotAnimation = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 220,
      damping: 14,
      delay: 0.15,
    },
  },
};

function TimelineItem({
  item,
  index,
}: {
  item: TimelineItemData;
  index: number;
}) {
  const isEducation = item.type === "education";
  const TypeIcon = isEducation ? FaUserGraduate : FaBriefcase;
  const isEven = index % 2 === 0;

  return (
    <motion.div
      variants={journeyItem}
      className="relative flex w-full mb-16 md:mb-24 justify-start md:justify-center group"
    >
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{
          duration: 0.7,
          delay: 0.15,
          ease: cubicBezier(0.16, 1, 0.3, 1),
        }}
        className={`absolute left-10 top-5 h-[2px] w-6 origin-left md:hidden ${
          isEducation ? "bg-blue-500/80" : "bg-emerald-500/80"
        }`}
      />

      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{
          duration: 0.7,
          delay: 0.15,
          ease: cubicBezier(0.16, 1, 0.3, 1),
        }}
        className={`absolute left-1/2 top-5 hidden h-[2px] w-12 md:block origin-left ${
          isEducation ? "bg-blue-500/80" : "bg-emerald-500/80"
        } ${isEven ? "-translate-x-full origin-right" : ""}`}
      />

      <motion.div
        variants={dotAnimation}
        className={`absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-10 h-10 rounded-full border-[3px] z-10 flex items-center justify-center bg-[#0a0a0a] ${
          isEducation ? "border-blue-500 text-blue-400" : "border-emerald-500 text-emerald-400"
        }`}
        whileHover={{
          scale: 1.18,
          boxShadow: isEducation
            ? "0 0 28px rgba(59, 130, 246, 0.35)"
            : "0 0 28px rgba(16, 185, 129, 0.35)",
          transition: { duration: 0.25 },
        }}
      >
        <TypeIcon className="text-sm" />
      </motion.div>

      <div
        className={`w-full ml-16 md:ml-0 md:w-1/2 flex flex-col ${
          isEven
            ? "md:pr-12 md:text-right"
            : "md:pl-12 md:ml-auto md:text-left"
        }`}
      >
        <motion.div variants={journeyItem}>
          <motion.div
            initial="rest"
            whileHover="hover"
            variants={cardHover}
            className="relative bg-[#121212] border border-[#222222] p-6 md:p-8 rounded-2xl shadow-xl hover:border-white/35 transition-colors duration-500 overflow-hidden"
          >
            <span
              className={`relative z-10 inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider rounded-full uppercase ${
                isEducation
                  ? "bg-blue-950/60 text-blue-400 border border-blue-800/50"
                  : "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50"
              }`}
            >
              {item.type}
            </span>

            <div
              className={`relative z-10 flex items-center gap-2 mb-3 text-[#aaaaaa] font-semibold text-sm ${
                isEven ? "md:justify-end" : "justify-start"
              }`}
            >
              <FaCalendar /> {item.date}
            </div>

            <h4 className="relative z-10 text-xl md:text-2xl font-bold text-white mb-2">
              {item.title}
            </h4>

            <h5 className="relative z-10 text-sm md:text-base text-[#aaaaaa] mb-4 font-medium">
              {item.subtitle}
            </h5>

            <p className="relative z-10 text-[#cccccc] text-sm leading-relaxed mb-4">
              {item.desc}
            </p>

            {item.highlight && (
              <motion.div
                whileHover={{
                  borderColor: "rgba(255, 255, 255, 0.25)",
                }}
                className={`relative z-10 mt-6 p-4 bg-[#181818] rounded-xl border border-[#2a2a2a] text-left ${
                  isEven ? "md:text-right" : ""
                }`}
              >
                <strong className="block text-white mb-3 font-semibold">
                  {item.highlight.title}
                </strong>

                <div
                  className={`flex flex-col sm:flex-row gap-4 items-center ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <p className="text-sm text-[#aaaaaa] flex-1 leading-relaxed">
                    {item.highlight.text}
                  </p>

                  <motion.div
                    whileHover={{
                      scale: 1.06,
                      rotate: 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={item.highlight.image}
                      alt={item.highlight.title}
                      width={90}
                      height={90}
                      className="rounded-lg object-cover border border-[#333] shadow-md"
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}

            {item.tech && (
              <div
                className={`relative z-10 mt-6 flex flex-wrap gap-2 ${
                  isEven ? "md:justify-end" : "justify-start"
                }`}
              >
                {item.tech.map((t, techIndex) => (
                  <motion.span
                    key={t}
                    initial={{
                      opacity: 0,
                      scale: 0.85,
                    }}
                    whileInView={{
                      opacity: 1,
                      scale: 1,
                    }}
                    viewport={{
                      once: true,
                      amount: 0.8,
                    }}
                    transition={{
                      duration: 0.35,
                      delay: 0.35 + techIndex * 0.04,
                    }}
                    whileHover={{
                      y: -2,
                      borderColor: "rgba(255, 255, 255, 0.4)",
                    }}
                    className="px-3 py-1.5 bg-[#181818] border border-[#2a2a2a] text-[#cccccc] text-xs rounded-md shadow-sm transition-colors"
                  >
                    {t}
                  </motion.span>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function About() {
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

    // Wheel / trackpad: only a fresh upward gesture made while already
    // at the top counts, so momentum from scrolling up won't skip the page.
    let lastWheelAt = 0;
    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      const isFreshGesture = now - lastWheelAt > 200;
      lastWheelAt = now;

      if (e.deltaY < -20 && atTop() && isFreshGesture) go("/");
      if (e.deltaY > 20 && atBottom() && isFreshGesture) go("/projects");
    };

    // Touch: the swipe must start at the relevant edge.
    let startY = 0;
    let startedAtTop = false;
    let startedAtBottom = false;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startedAtTop = atTop();
      startedAtBottom = atBottom();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (
        startedAtTop &&
        e.touches[0].clientY - startY > 60 &&
        atTop()
      ) {
        go("/");
      } else if (
        startedAtBottom &&
        startY - e.touches[0].clientY > 60
      ) {
        go("/projects");
      }
    };

    // Keyboard: ignore held-down key repeats and text-entry controls.
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
        go("/");
      } else if (
        ["ArrowDown", "PageDown", "End"].includes(e.key) &&
        atBottom()
      ) {
        go("/projects");
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
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col px-6 lg:px-24 py-16 gap-6">
      
      {/* Page Heading */}
      <motion.div
        className="about-heading-area mb-2"
        initial={{ opacity: 0, y: -25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.7,
          ease: cubicBezier(0.16, 1, 0.3, 1),
        }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
          About Me
        </h1>

        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: 80 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.7,
            delay: 0.25,
            ease: cubicBezier(0.16, 1, 0.3, 1),
          }}
          className="h-1 bg-white rounded"
        />
      </motion.div>

      {/* Hero Intro: Two-Column Layout with Profile Picture & Bio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
        
        {/* Left Column: Profile Picture Card */}
        <motion.div 
          className="lg:col-span-4 flex justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative w-56 h-56 lg:w-72 lg:h-72 rounded-3xl overflow-hidden border border-[#2a2a2a] bg-[#121212] shadow-2xl group">
            <Image
              src="/hero2.png"
              alt="Nkuin Eugene"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <span className="text-xs font-mono uppercase tracking-wider text-[#cccccc] bg-black/50 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                Software Engineer
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Bio & Quick Stats */}
        <motion.div 
          className="lg:col-span-8 flex flex-col space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Hey, I'm <span >Nkuin Eugene</span>
          </h2>

          <p className="text-[#cccccc] text-base leading-relaxed">
            Software Engineer with 3+ years of experience building production mobile, web, and backend applications using Flutter, FastAPI, Angular, React, and Next.js[cite: 4]. Experienced in API development, payment integrations, automated testing, application security, and production deployment[cite: 4].
          </p>

          <p className="text-[#aaaaaa] text-sm leading-relaxed">
            A EFARM, I shipped a Flutter app live on the Apple App Store and Google Play, building a platform serving 8,193 users—improving order completion by 40%, checkout conversion by 25%, and load times by 40%[cite: 4]. I've also dockerized REST APIs and deployed them to live AWS EC2 instances[cite: 4].
          </p>

          {/* Quick Highlight Badges / Mini Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-[#121212] border border-[#222222] p-3 rounded-xl">
              <span className="block text-white font-bold text-lg">3+ Years</span>
              <span className="text-xs text-[#888888]">Experience</span>
            </div>
            <div className="bg-[#121212] border border-[#222222] p-3 rounded-xl">
              <span className="block text-white font-bold text-lg">8,100+</span>
              <span className="text-xs text-[#888888]">Platform Users[cite: 4]</span>
            </div>
            <div className="bg-[#121212] border border-[#222222] p-3 rounded-xl col-span-2 sm:col-span-1">
              <span className="block text-white font-bold text-lg">AWS & Docker</span>
              <span className="text-xs text-[#888888]">Cloud DevOps[cite: 4]</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <motion.a
              href="/cv/NKUIN 2026 v2.pdf"
              download
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full text-sm transition-colors shadow-lg shadow-white/10"
            >
              <FaDownload /> Download CV
            </motion.a>

            <motion.a
              href="#"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 bg-[#121212] border border-[#333333] hover:border-white text-white font-medium rounded-full text-sm transition-colors"
            >
              <FaPaperPlane /> Hire Me
            </motion.a>
          </div>

        </motion.div>
      </div>

 

      {/* SKILLS */}
      <section className="w-full mb-24">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.8,
            ease: cubicBezier(0.16, 1, 0.3, 1),
          }}
        >
          <h2 className="text-3xl font-bold text-white mb-2">Skills</h2>

          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 48 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: 0.15,
            }}
            className="h-1 bg-white rounded mb-10"
          />
        </motion.div>

        <div className="space-y-10">
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                duration: 0.7,
                delay: categoryIndex * 0.05,
                ease: cubicBezier(0.16, 1, 0.3, 1),
              }}
            >
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white">
                    {category.title}
                  </h3>

                  <p className="text-[#888888] text-sm mt-1">
                    {category.description}
                  </p>
                </div>

                <span className="hidden sm:block text-xs text-[#777777] font-medium">
                  {category.skills.length}{" "}
                  {category.skills.length === 1 ? "skill" : "skills"}
                </span>
              </div>

              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                  amount: 0.1,
                }}
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.08,
                    },
                  },
                }}
              >
                {category.skills.map((skill) => (
                  <motion.div
                    key={skill.name}
                    variants={{
                      hidden: {
                        opacity: 0,
                        y: 25,
                        scale: 0.94,
                      },
                      visible: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: {
                          duration: 0.45,
                          ease: cubicBezier(0.16, 1, 0.3, 1),
                        },
                      },
                    }}
                    whileHover={{
                      y: -7,
                      scale: 1.025,
                      transition: {
                        duration: 0.25,
                      },
                    }}
                    className="flex flex-col items-center justify-center p-6 bg-[#121212] rounded-xl border border-[#222222] hover:border-white/50 hover:shadow-[0_15px_35px_rgba(255,255,255,0.04)] transition-colors duration-300 gap-4 group relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    />

                    <motion.div
                      className="relative z-10"
                      whileHover={{
                        scale: 1.15,
                        rotate: -4,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                    >
                      <skill.icon size={36} color={skill.color} />
                    </motion.div>

                    <span className="relative z-10 text-sm font-medium text-[#cccccc] text-center">
                      {skill.name}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TIMELINE SECTION */}
      <section className="w-full mb-12">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.8,
            ease: cubicBezier(0.16, 1, 0.3, 1),
          }}
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            My Journey
          </h2>

          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 48 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: 0.15,
            }}
            className="h-1 bg-white rounded mb-16"
          />
        </motion.div>

        <div className="relative w-full max-w-5xl mx-auto pb-10">
          <motion.div
            variants={timelineLine}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.05,
            }}
            className="absolute left-5 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-white via-white/50 to-[#222222] md:-translate-x-1/2 z-0 rounded-full origin-top"
          />

          <motion.div
            variants={journeyContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.08,
            }}
          >
            {journeyItems.map((item, i) => (
              <TimelineItem
                key={`${item.title}-${i}`}
                item={item}
                index={i}
              />
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}