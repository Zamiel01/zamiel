"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  FaDownload,
  FaPaperPlane,
  FaGraduationCap,
  FaLocationDot,
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaBriefcase,
  FaTrophy,
  FaBolt,
  FaCalendar,
  FaUserGraduate,
} from "react-icons/fa6";

const infoData = [
  { icon: FaGraduationCap, label: "Degree", value: "B.Tech Software Engineering" },
  { icon: FaLocationDot, label: "City", value: "Douala, Cameroon" },
  { icon: FaEnvelope, label: "Email", value: "nkuinmbeng@gmail.com" },
  { icon: FaGithub, label: "GitHub", value: "github.com/zamiel01" },
  { icon: FaLinkedin, label: "LinkedIn", value: "linkedin.com/in/nkuineugene" },
  { icon: FaBriefcase, label: "Experience", value: "3+ Years" },
  { icon: FaTrophy, label: "Competition", value: "GETEC 2025 Finalist" },
  { icon: FaBolt, label: "Freelance", value: "Available" },
];

const skills = [
  { name: "Flutter / Dart", width: "90%" },
  { name: "Angular / TypeScript", width: "88%" },
  { name: "React / Next.js", width: "82%" },
  { name: "FastAPI / Python", width: "85%" },
  { name: "DevOps / Server (Nginx, PM2)", width: "78%" },
  { name: "Cybersecurity / Pentesting", width: "70%" },
];

const education = [
  {
    date: "Expected 2025 / 2026",
    title: "Bachelor of Technology – Software Engineering",
    subtitle: "Institut Universitaire de la Côte (IUC)",
    desc: "Studied at IUC's School of Engineering and Applied Science. Built a strong foundation in software architecture, algorithms, mobile and web development, and systems engineering.",
    highlight: {
      title: "Capstone Thesis — 3rd Year Project",
      text: 'Co-designed "Real-Time Object Detection Glasses" — combining hardware with GenAI models for visually impaired aid. Finalist in the GETEC National Competition 2025.',
      image: "/images/graduation.png",
    },
  },
  {
    date: "2020 – 2023",
    title: "Advanced Level GCE (A-Levels)",
    subtitle: "Government Bilingual High School — Douala",
    desc: "Completed advanced secondary schooling in Douala, sitting for the Advanced Level GCE examinations in June 2023.",
  },
  {
    date: "2019 – 2020",
    title: "Ordinary Level GCE (O-Levels)",
    subtitle: "GBHS Mamabanda",
    desc: "Successfully obtained the Ordinary Level Certificate at the end of the 2019/2020 academic cycle.",
  },
];

const experience = [
  {
    date: "Oct 2023 – Feb 2026",
    title: "Flutter Mobile & Angular Web Developer",
    subtitle: "eFarm — Douala, Cameroon",
    desc: "Developed marketplace systems supporting thousands of listings, improving order completion by 40%. Integrated Flutterwave/PayUnit and deployed services using Nginx configurations on Ubuntu VPS environments with high CI/CD automation profiles.",
    tech: ["Angular 15", "TypeScript", "NGXS", "RxJS", "Flutter", "Dart", "Nginx", "Ubuntu VPS"],
  },
  {
    date: "Sept 2022 – Mar 2023",
    title: "Backend Engineer",
    subtitle: "FASBI — Douala, Cameroon",
    desc: "Built secure Todo Management REST APIs using FastAPI supporting OAuth2 flows. Streamlined structured data handling performance operations up to 40% via advanced SQLAlchemy database modeling.",
    tech: ["Python", "FastAPI", "SQLAlchemy", "SQLite", "JWT"],
  },
];

function JourneyBox({ data, index }: { data: any; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`journey-box ${isVisible ? "slide-in-active" : ""}`}>
      <div className="journey-date">
        <FaCalendar /> {data.date}
      </div>
      <h4 className="journey-title">{data.title}</h4>
      <div className="journey-subtitle">{data.subtitle}</div>
      <p className="journey-desc">{data.desc}</p>
      {data.highlight && (
        <div className="journey-inner-highlight">
          <strong>{data.highlight.title}</strong>
          <div className="highlight-content-wrapper">
            <div className="highlight-text-box">
              <p className="journey-desc">{data.highlight.text}</p>
            </div>
            <Image
              src={data.highlight.image}
              alt={data.highlight.title}
              width={85}
              height={110}
              className="journey-profile-img"
            />
          </div>
        </div>
      )}
      {data.tech && (
        <div className="journey-tech-stack">
          {data.tech.map((t: string) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function About() {
  const [activeTab, setActiveTab] = useState("education-column");
  const [skillBars, setSkillBars] = useState(false);

  useEffect(() => {
    setTimeout(() => setSkillBars(true), 300);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 lg:px-24 py-12 gap-4">
      <div className="about-heading-area">
        <h1 className="about-title">About Me</h1>
      </div>

      <h2 className="about-subtitle">
        I'm Nkuin Eugene — <span>Software Engineer</span>
      </h2>

      <p className="about-description">
        Results-driven Software Engineer with 3+ years of experience building cross-platform mobile, web, and full-stack
        applications. I specialize in Flutter, Angular, React, and FastAPI, with production experience in server deployment,
        payment integrations, and cybersecurity. I'm a GETEC National Competition 2025 Finalist, passionate about delivering
        high-impact solutions in agritech, fintech, and civic tech across the African context.
      </p>

      <div className="about-content-grid">
        <div className="info-fields-grid">
          {infoData.map((item) => (
            <div className="info-item" key={item.label}>
              <item.icon className="hidden lg:hidden" />
              <span className="info-label">{item.label}</span>
              <span className="info-value">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="skills-container">
          {skills.map((skill) => (
            <div className="skill-bar-wrapper" key={skill.name}>
              <div className="skill-meta">
                <span className="skill-name">{skill.name}</span>
                <span className="skill-percent-badge">{skill.width}</span>
              </div>
              <div className="skill-progress-track">
                <div
                  className="skill-progress-fill"
                  style={{ width: skillBars ? skill.width : "0%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="about-actions">
        <a href="/cv/NKUIN 2026 v2.pdf" download className="btn-action btn-fill">
          <FaDownload /> Download CV
        </a>
        <a href="#" className="btn-action btn-outline">
          <FaPaperPlane /> Hire Me
        </a>
      </div>

      <h2 className="journey-section-title">
        My <span>Journey</span>
      </h2>

      <div className="journey-tabs">
        <button
          className={`journey-tab-btn ${activeTab === "education-column" ? "active" : ""}`}
          onClick={() => setActiveTab("education-column")}
        >
          <FaUserGraduate /> Education
        </button>
        <button
          className={`journey-tab-btn ${activeTab === "experience-column" ? "active" : ""}`}
          onClick={() => setActiveTab("experience-column")}
        >
          <FaBriefcase /> Experience
        </button>
      </div>

      <div className="journey-row">
        <div className={`journey-column ${activeTab === "education-column" ? "active-tab-content" : ""}`} id="education-column">
          <h3 className="journey-column-title">Education</h3>
          <div className="journey-timeline-wrapper">
            {education.map((item, i) => (
              <JourneyBox key={i} data={item} index={i} />
            ))}
          </div>
        </div>

        <div className={`journey-column ${activeTab === "experience-column" ? "active-tab-content" : ""}`} id="experience-column">
          <h3 className="journey-column-title">Experience</h3>
          <div className="journey-timeline-wrapper">
            {experience.map((item, i) => (
              <JourneyBox key={i} data={item} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
