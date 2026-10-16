"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { FaPhone, FaEnvelope, FaLocationDot, FaPaperPlane } from "react-icons/fa6";
import { usePageTransition } from "../components/PageTransitionProvider";

export default function Contact() {
  const { navigate } = usePageTransition();
  const navigating = useRef(false);

  useEffect(() => {
    const goToProjects = () => {
      if (navigating.current) return;
      navigating.current = true;
      navigate("/projects");
    };

    const atTop = () => window.scrollY <= 0;

    // Only a fresh upward wheel / trackpad gesture at the top transitions back.
    let lastWheelAt = 0;
    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      const isFreshGesture = now - lastWheelAt > 200;
      lastWheelAt = now;

      if (e.deltaY < -20 && atTop() && isFreshGesture) goToProjects();
    };

    // Touch swipes must start at the top and pull down.
    let startY = 0;
    let startedAtTop = false;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startedAtTop = atTop();
    };
    const onTouchMove = (e: TouchEvent) => {
      if (startedAtTop && e.touches[0].clientY - startY > 60 && atTop()) {
        goToProjects();
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
        goToProjects();
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
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6 lg:px-24 py-16">
      
      {/* Main Grid Wrapper */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Contact Info & Details */}
        <motion.div 
          className="lg:col-span-5 flex flex-col space-y-8"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#888888]">
              GET IN TOUCH
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-2 tracking-tight">
              Let's Work <span >Together</span>
            </h1>
            <p className="text-[#aaaaaa] mt-4 text-sm sm:text-base leading-relaxed">
              I'm currently looking for new project opportunities or full-time roles. If you have an inquiry, technical proposition, or just want to say hi, feel free to drop a line!
            </p>
          </div>

          {/* Contact Cards Stack */}
          <div className="space-y-4">
            
            {/* Phone Item */}
            <div className="flex items-center space-x-4 bg-[#121212] border border-[#222222] p-4 rounded-2xl hover:border-white/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#333333] flex items-center justify-center text-white flex-shrink-0">
                <FaPhone className="text-sm" />
              </div>
              <div>
                <span className="block text-xs font-mono text-[#888888] uppercase tracking-wider">Phone</span>
                <span className="text-white font-medium text-sm sm:text-base">+237 678-677-213</span>
              </div>
            </div>

            {/* Email Item */}
            <div className="flex items-center space-x-4 bg-[#121212] border border-[#222222] p-4 rounded-2xl hover:border-white/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#333333] flex items-center justify-center text-white flex-shrink-0">
                <FaEnvelope className="text-sm" />
              </div>
              <div>
                <span className="block text-xs font-mono text-[#888888] uppercase tracking-wider">Email</span>
                <span className="text-white font-medium text-sm sm:text-base">nkuinmbeng@gmail.com</span>
              </div>
            </div>

            {/* Address Item */}
            <div className="flex items-center space-x-4 bg-[#121212] border border-[#222222] p-4 rounded-2xl hover:border-white/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#333333] flex items-center justify-center text-white flex-shrink-0">
                <FaLocationDot className="text-sm" />
              </div>
              <div>
                <span className="block text-xs font-mono text-[#888888] uppercase tracking-wider">Address</span>
                <span className="text-white font-medium text-sm sm:text-base">Douala, Cameroon</span>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Right Column: Contact Form */}
        <motion.div 
          className="lg:col-span-7 bg-[#121212] border border-[#222222] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
            Contact <span >Me!</span>
          </h2>

          <form action="#" method="POST" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Full Name" 
                  required 
                  className="w-full bg-[#181818] border border-[#2a2a2a] text-white placeholder-[#777777] text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email Address" 
                  required 
                  className="w-full bg-[#181818] border border-[#2a2a2a] text-white placeholder-[#777777] text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input 
                  type="tel" 
                  name="phone" 
                  placeholder="Phone Number" 
                  className="w-full bg-[#181818] border border-[#2a2a2a] text-white placeholder-[#777777] text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div>
                <input 
                  type="text" 
                  name="subject" 
                  placeholder="Email Subject" 
                  className="w-full bg-[#181818] border border-[#2a2a2a] text-white placeholder-[#777777] text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <div>
              <textarea 
                name="message" 
                rows={5} 
                placeholder="Your Message" 
                required 
                className="w-full bg-[#181818] border border-[#2a2a2a] text-white placeholder-[#777777] text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-white transition-colors resize-none"
              />
            </div>

            <div>
              <motion.button 
                type="submit" 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white text-black font-semibold px-8 py-3.5 rounded-full text-sm hover:bg-[#e0e0e0] transition-colors shadow-lg shadow-white/10 cursor-pointer"
              >
                <span>Send Message</span>
                <FaPaperPlane className="text-xs" />
              </motion.button>
            </div>
          </form>

        </motion.div>

      </div>
    </div>
  );
}