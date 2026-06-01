"use client";

import { usePageTransition } from "./PageTransitionProvider";
import { ReactNode } from "react";

interface TransitionLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  active?: boolean;
  onClick?: () => void;
}

export default function TransitionLink({
  href,
  children,
  className,
  active,
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
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
