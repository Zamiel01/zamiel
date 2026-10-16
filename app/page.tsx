"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import TransitionLink from "./components/TransitionLink";
import { usePageTransition } from "./components/PageTransitionProvider";
import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaEnvelope,
  FaCheck,
  FaVolumeHigh,
  FaDownload,
} from "react-icons/fa6";

const words = ["Software Engineer", "Web Developer", "Mobile Developer", "Design Engineer"];

function useTypewriter() {
  const [displayed, setDisplayed] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    const speed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentWord.length) {
      const timer = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(timer);
    }

    if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
      const timer = setTimeout(() => {}, 300);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      if (isDeleting) {
        setCharIndex((prev) => prev - 1);
        setDisplayed(currentWord.substring(0, charIndex - 1));
      } else {
        setCharIndex((prev) => prev + 1);
        setDisplayed(currentWord.substring(0, charIndex + 1));
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, wordIndex]);

  return displayed;
}

export default function Home() {
  const typewriterText = useTypewriter();
  const { navigate } = usePageTransition();
  const navigating = useRef(false);

  useEffect(() => {
    const go = () => {
      if (navigating.current) return;
      navigating.current = true;
      navigate("/about");
    };

    const atBottom = () =>
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 5;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 20 && atBottom()) go();
    };

    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (startY - e.touches[0].clientY > 60 && atBottom()) go();
    };

    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown"].includes(e.key) && atBottom()) go();
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
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 sm:p-6 lg:p-12 font-sans">
      {/* Outer Card Container */}
      <div className="w-full max-w-4xl bg-[#121212] border border-[#222222] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-8 lg:gap-12">
          {/* Left Column: Profile Picture */}
          <div className="flex items-center justify-center lg:w-1/2 lg:pr-8 lg:border-r lg:border-[#222222] border-b lg:border-b-0 border-[#222222] pb-8 lg:pb-0 w-full">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-72 lg:h-72 rounded-full overflow-hidden border-2 border-[#2a2a2a] bg-[#1a1a1a] shadow-inner flex-shrink-0">
              <Image
                src="/hero2.png"
                alt="Nkuin Eugene Profile"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Right Column: Bio & Info */}
          <div className="flex flex-col justify-center lg:w-1/2 w-full space-y-6">
            {/* Top Label / Tag */}
            <div>
              <span className="text-xs tracking-[0.2em] font-mono text-[#888888] uppercase">
                PORTFOLIO
              </span>
            </div>

            {/* Name with Verified Badge */}
            <div className="flex items-center space-x-3 pt-1 border-t border-[#222222] sm:border-t-0 sm:pt-0">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                Nkuin Eugene
              </h1>
              <div className="flex items-center space-x-1.5 text-[#888888]">
                <div className="w-5 h-5 rounded-full border border-[#444] flex items-center justify-center bg-[#1a1a1a]">
                  <FaCheck className="text-[10px] text-white" />
                </div>
                <FaVolumeHigh className="text-xs cursor-pointer hover:text-white transition-colors" />
              </div>
            </div>

            {/* Role / Subtitle with Typewriter */}
            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {typewriterText}
                <span className="animate-pulse">|</span>
              </h2>
              <p className="text-[#a0a0a0] text-sm sm:text-base leading-relaxed">
                Bridging the gap between robust software engineering and pixel-perfect design. Building clean, accessible web and mobile interfaces with React, Next.js, and Flutter.
              </p>
            </div>

            {/* Tech Badges / Skills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {["Flutter", "React", "Next.js", "Angular", "FastAPI", "TypeScript", "Python"].map((skill) => (
                <span
                  key={skill}
                  className="bg-[#1e1e1e] text-[#cccccc] border border-[#2a2a2a] text-xs px-3 py-1 rounded-full font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Action Buttons & Social Icons */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <TransitionLink
                href="/about"
                className="inline-flex items-center justify-center space-x-2 bg-white text-black font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-[#e0e0e0] transition-colors"
              >
                <FaEnvelope className="text-sm" />
                <span>Contact Me</span>
              </TransitionLink>

              <a
                href="/cv/NKUIN 2026 v2.pdf"
                download
                className="w-10 h-10 rounded-full border border-[#333333] bg-[#161616] flex items-center justify-center text-white hover:bg-[#222222] transition-colors"
                title="Download CV"
              >
                <FaDownload className="text-xs" />
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-[#333333] bg-[#161616] flex items-center justify-center text-[#aaaaaa] hover:text-white hover:bg-[#222222] transition-colors"
              >
                <FaGithub className="text-sm" />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-[#333333] bg-[#161616] flex items-center justify-center text-[#aaaaaa] hover:text-white hover:bg-[#222222] transition-colors"
              >
                <FaLinkedin className="text-sm" />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-[#333333] bg-[#161616] flex items-center justify-center text-[#aaaaaa] hover:text-white hover:bg-[#222222] transition-colors"
              >
                <FaInstagram className="text-sm" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}