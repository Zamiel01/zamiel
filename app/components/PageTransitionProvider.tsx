"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useCallback, createContext, useContext, useEffect, useRef } from "react";

interface TransitionContextType {
  isTransitioning: boolean;
  navigate: (href: string) => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevPathRef = useRef(pathname);

  const navigate = useCallback(
    (href: string) => {
      if (isTransitioning) return;
      
      // Don't transition if same page
      const currentPath = window.location.pathname;
      if (href === currentPath || (href === "/" && currentPath === "/")) return;
      
      setIsTransitioning(true);

      const main = document.querySelector("main");
      if (main) {
        main.style.transition =
          "transform 380ms cubic-bezier(0.76, 0, 0.24, 1), opacity 380ms cubic-bezier(0.76, 0, 0.24, 1)";
        main.classList.add("slide-exit");
      }

      setTimeout(() => {
        router.push(href);
      }, 380);
    },
    [router, isTransitioning]
  );

  // Handle enter animation when pathname changes
  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      prevPathRef.current = pathname;
      
      const main = document.querySelector("main");
      if (main) {
        // Clear the old exit class before starting enter animation
        main.classList.remove("slide-exit");
        // Start with enter position
        main.style.transition = "none";
        main.classList.add("slide-enter-start");
        
        // Force reflow
        void main.offsetHeight;
        
        // Animate in
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            main.style.transition =
              "transform 380ms cubic-bezier(0.76, 0, 0.24, 1), opacity 380ms cubic-bezier(0.76, 0, 0.24, 1)";
            main.classList.remove("slide-enter-start");
          });
        });
      }
      
      setIsTransitioning(false);
    }
  }, [pathname]);

  return (
    <TransitionContext.Provider value={{ isTransitioning, navigate }}>
      {children}
    </TransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(TransitionContext);
  if (!context) throw new Error("usePageTransition must be used within PageTransitionProvider");
  return context;
}
