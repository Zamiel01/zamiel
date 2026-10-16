"use client";

import { usePageTransition } from "./PageTransitionProvider";
import { ReactNode } from "react";

interface TransitionLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  active?: boolean;
  "aria-current"?: "page";
  onClick?: () => void;
}

export default function TransitionLink({
  href,
  children,
  className,
  active,
  "aria-current": ariaCurrent,
  onClick,
}: TransitionLinkProps) {
  const { navigate } = usePageTransition();

  const handleClick = (e: React.MouseEvent) => {
    if (
      href.startsWith("http") ||
      href.startsWith("mailto") ||
      href.startsWith("tel") ||
      href.startsWith("#") ||
      href.startsWith("//")
    ) {
      return;
    }
    
    e.preventDefault();
    
    if (onClick) onClick();
    
    navigate(href);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      aria-current={active ? "page" : ariaCurrent}
    >
      {children}
    </a>
  );
}
