"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Script from "next/script";
import TransitionLink from "./components/TransitionLink";
import SplineViewer from "./components/SplineViewer";
import { FaDownload, FaRotate } from "react-icons/fa6";

const words = ["Web Developer", "Mobile Developer", "Pentester", "Graphic Designer"];

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

function FlipCard({ id, width, height, borderRadius, frontContent, backContent }: any) {
  const [flipped, setFlipped] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!flipped) {
        setShake(true);
        setTimeout(() => setShake(false), 700);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [flipped]);

  return (
    <div
      className={`flip-card ${flipped ? "flipped" : ""} ${shake ? "hint-shake" : ""}`}
      id={id}
      style={{ width, height, borderRadius: borderRadius || "0" }}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="flip-card-inner" style={{ borderRadius: borderRadius || "0" }}>
        <div className="flip-card-front" style={{ borderRadius: borderRadius || "0", overflow: "hidden" }}>
          {frontContent}
        </div>
        <div className="flip-card-back" style={{ borderRadius: borderRadius || "0", overflow: "hidden" }}>
          {backContent}
        </div>
      </div>
      {!borderRadius && (
        <div className="flip-hint">
          <FaRotate />
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const typewriterText = useTypewriter();

  return (
    <>
      <Script
        src="https://unpkg.com/@splinetool/viewer@1.9.48/build/spline-viewer.js"
        type="module"
        strategy="lazyOnload"
      />
      <div className="flex-1 min-h-screen flex items-center relative px-6 lg:px-24 py-12">
        <div className="hero-bg-radar" />

        <div className="w-full flex flex-col items-center text-center lg:text-left lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center relative z-10">
          <div className="block lg:hidden mb-6" style={{ perspective: "1000px" }}>
            <FlipCard
              id="profile-flip-card-mobile"
              width="220px"
              height="220px"
              borderRadius="50%"
              frontContent={
                <div className="w-full h-full rounded-full border-2 border-dashed border-[var(--primary-red)] overflow-hidden">
                  <Image
                    src="/hero2.png"
                    alt="Nkuin Eugene Profile"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              }
              backContent={
                <SplineViewer
                  url="https://prod.spline.design/yF2DnayEXh1t-ohq/scene.splinecode"
                  style={{ width: "100%", height: "100%", background: "transparent" }}
                />
              }
            />
          </div>

          <div className="lg:col-span-7 space-y-4 lg:space-y-6 flex flex-col items-center lg:items-start w-full mt-2 lg:mt-0">
            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight leading-tight">
              Hello, my name is <br className="hidden lg:block" />
              <span className="text-accent-red font-handwritten text-4xl lg:text-6xl block mt-2 lg:inline lg:mt-0">
                Nkuin Eugene
              </span>
            </h1>

            <h2 className="text-2xl lg:text-4xl font-bold pb-2 lg:pb-0">
              I'm a <span className="text-accent-red">{typewriterText}</span>
              <span className="cursor-blink">|</span>
            </h2>

            <p className="text-[var(--text-muted)] text-[15px] lg:text-base max-w-xl leading-relaxed opacity-90 px-2 lg:px-0">
              I'm Nkuin Eugene Mbeng, a Software Engineer with over 3 years of experience building mobile and web applications.
              <span className="hidden md:inline">
                {" "}I specialize in Flutter for mobile and React/Next.js/Angular for the web, with solid backend skills in FastAPI and Python.
              </span>
            </p>

            <div className="hidden md:flex flex-wrap justify-center lg:justify-start gap-2 pt-2 max-w-xl">
              {["Flutter", "Angular", "React", "Next.js", "FastAPI", "NestJS", "Python", "TypeScript", "Ubuntu VPS", "Nginx", "CI/CD"].map(
                (badge) => (
                  <span
                    key={badge}
                    className="bg-badge text-[11px] tracking-wider uppercase px-3 py-1.5 rounded-full font-semibold border"
                  >
                    {badge}
                  </span>
                )
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 lg:pt-6 w-full sm:w-auto pb-8 lg:pb-0">
              <TransitionLink
                href="/about"
                className="btn-action btn-fill text-center text-sm px-[35px] py-[13px] rounded-[30px] font-semibold w-full sm:w-auto"
              >
                More About Me
              </TransitionLink>
              <a
                href="/cv/NKUIN 2026 v2.pdf"
                download
                className="btn-action btn-outline text-center text-sm px-[35px] py-[13px] rounded-[30px] font-semibold flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <FaDownload className="text-sm" />
                <span>Download CV</span>
              </a>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-5 relative p-4 justify-self-end">
            <FlipCard
              id="profile-flip-card"
              width="340px"
              height="440px"
              frontContent={
                <>
                  <div className="frame-corner absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 z-10" />
                  <div className="frame-corner absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 z-10" />
                  <div className="w-[340px] h-[440px] overflow-hidden shadow-2xl relative border-theme border">
                    <Image
                      src="/hero2.png"
                      alt="Nkuin Eugene Profile"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </>
              }
              backContent={
                <SplineViewer
                  url="https://prod.spline.design/yF2DnayEXh1t-ohq/scene.splinecode"
                  loading="lazy"
                  style={{ width: "100%", height: "100%", background: "transparent" }}
                />
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}
