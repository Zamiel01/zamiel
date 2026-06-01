"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { FaArrowUpRightFromSquare, FaGithub, FaChevronLeft, FaChevronRight } from "react-icons/fa6";

const projects = [
  {
    name: "eFarm Marketplace",
    description:
      "Agricultural e-commerce platform for Cameroon — connecting farmers and buyers with product listings, multi-provider payments, and a PWA-optimized experience. Achieved 40% faster load times and 25% higher checkout conversion in production.",
    tech: "Angular 20, NGXS, Flutterwave, PayUnit, Nginx, PM2",
    image: "/images/efarmweb.png",
    live: "https://efarm.cm",
    github: "https://github.com/zamiel01",
  },
  {
    name: "eFarm Mobile App",
    description:
      "Cross-platform Flutter app powering the eFarm agricultural marketplace on Android and iOS. Features BLoC state management, integrated Flutterwave & PayUnit payments, offline-capable architecture, and 95% automated test coverage across critical modules.",
    tech: "Flutter, Dart, BLoC/Cubit, Firebase, SQLite, REST APIs",
    image: "/images/mobile.jpg",
    live: "https://efarm.cm",
    github: "https://github.com/zamiel01",
    portrait: true,
  },
  {
    name: "GodsEye",
    description:
      "Cybersecurity platform for locating lost phones and checking email/password exposure in known data breaches. Built as a full-stack web application with real-time breach lookup and device tracking features.",
    tech: "Next.js, React, Supabase, TypeScript",
    image: "/images/godseye.png",
    live: "https://godseye.vercel.app",
    github: "https://github.com/zamiel01",
  },
  {
    name: "Todo Management API",
    description:
      "Production-ready REST API built with FastAPI supporting multi-user authenticated CRUD operations. Features JWT authentication, OAuth2 login flow, SQLAlchemy ORM data models, and 95% automated test coverage via Pytest.",
    tech: "Python, FastAPI, SQLAlchemy, SQLite, JWT, Pytest",
    image: "/images/api.png",
    github: "https://github.com/zamiel01",
  },
  {
    name: "Real-Time Object Detection Glasses",
    description:
      "End-of-year capstone project co-designed for the GETEC National Competition 2025. Combining embedded hardware with generative AI models to create assistive smart glasses that help visually impaired individuals interact with their environment in real time.",
    tech: "Python, TensorFlow, OpenCV, Raspberry Pi, GenAI, IoT",
    image: "/images/glasses.jpg",
    github: "https://github.com/zamiel01",
  },
];

export default function Projects() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const viewportRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (index: number, dir: "next" | "prev") => {
      if (index < 0 || index >= projects.length) return;
      setDirection(dir);
      setCurrent(index);
    },
    []
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(current - 1, "prev");
      if (e.key === "ArrowRight") goTo(current + 1, "next");
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [current, goTo]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    let startX = 0;
    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };
    const onEnd = (e: TouchEvent) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goTo(current + 1, "next");
        else goTo(current - 1, "prev");
      }
    };
    el.addEventListener("touchstart", onStart);
    el.addEventListener("touchend", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [current, goTo]);

  return (
    <div className="min-h-screen flex flex-col px-6 lg:px-24 py-12">
      <div className="portfolio-heading-area">
        <h1 className="portfolio-title">
          Latest <span>Projects</span>
        </h1>
      </div>

      <div className="project-showcase-wrapper">
        <div className="slides-viewport" ref={viewportRef}>
          {projects.map((project, index) => {
            let cls = "project-slide";
            if (index === current) cls += " active";
            else if (index === current - 1 && direction === "next") cls += " exit-left";
            else if (index === current + 1 && direction === "prev") cls += " exit-right";
            else cls += "";

            return (
              <div className={cls} key={index} data-index={index}>
                <div className="project-details">
                  <div className="project-number">0{index + 1}</div>
                  <h2 className="project-name">{project.name}</h2>
                  <p className="project-description">{project.description}</p>
                  <div className="project-tech-list">{project.tech}</div>
                  <div className="project-links">
                    {project.live && (
                      <a href={project.live} className="icon-btn" target="_blank" title="Live Site">
                        <FaArrowUpRightFromSquare />
                      </a>
                    )}
                    <a href={project.github} className="icon-btn" target="_blank" title="GitHub">
                      <FaGithub />
                    </a>
                  </div>
                </div>
                <div className="project-media">
                  <div className={`mockup-container ${project.portrait ? "mockup-portrait" : ""}`}>
                    <Image src={project.image} alt={project.name} fill className="object-cover" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="slider-navigation">
          <div className="slide-counter">
            <span>{current + 1}</span> / <span>{projects.length}</span>
          </div>
          <div
            className={`nav-arrow ${current === 0 ? "disabled" : ""}`}
            onClick={() => goTo(current - 1, "prev")}
          >
            <FaChevronLeft />
          </div>
          <div
            className={`nav-arrow ${current === projects.length - 1 ? "disabled" : ""}`}
            onClick={() => goTo(current + 1, "next")}
          >
            <FaChevronRight />
          </div>
        </div>
      </div>
    </div>
  );
}
